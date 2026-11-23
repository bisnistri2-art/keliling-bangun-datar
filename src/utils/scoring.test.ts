import test from 'node:test';
import assert from 'node:assert/strict';
import { ASSESSMENT_QUESTIONS, SEED_STUDENTS } from '../data/curriculum';
import {
  applyAttemptToStudent,
  computeUnlockedBadges,
  determineRewardTier,
  generateGradebookCsv,
  gradeAssessment,
  sortLeaderboard,
} from './scoring';

test('determines reward tiers and star counts accurately', () => {
  assert.equal(determineRewardTier(100).tier, 'emas');
  assert.equal(determineRewardTier(90).stars, 3);
  assert.equal(determineRewardTier(80).tier, 'perak');
  assert.equal(determineRewardTier(65).tier, 'perunggu');
  assert.equal(determineRewardTier(40).tier, 'pemula');
  assert.equal(determineRewardTier(40).stars, 1);
});

test('grades perfect assessment and calculates per-shape mastery', () => {
  const perfectAnswers: Record<string, number> = {};
  for (const q of ASSESSMENT_QUESTIONS) {
    perfectAnswers[q.id] = q.correctAnswer;
  }

  const evalResult = gradeAssessment(ASSESSMENT_QUESTIONS, perfectAnswers);
  assert.equal(evalResult.score, 100);
  assert.equal(evalResult.correctCount, 10);
  assert.equal(evalResult.maxStreak, 10);
  assert.equal(evalResult.rewardTier, 'emas');
  assert.equal(evalResult.masteryByShape.persegi.percentage, 100);
  assert.equal(evalResult.masteryByShape['persegi-panjang'].percentage, 100);
  assert.equal(evalResult.masteryByShape.segitiga.percentage, 100);
});

test('grades partial assessment and unlocks corresponding badges', () => {
  // Answer only square questions correctly
  const answers: Record<string, number> = {};
  for (const q of ASSESSMENT_QUESTIONS) {
    answers[q.id] = q.shape === 'persegi' ? q.correctAnswer : 9999;
  }

  const evalResult = gradeAssessment(ASSESSMENT_QUESTIONS, answers);
  assert.equal(evalResult.score, 30);
  assert.equal(evalResult.masteryByShape.persegi.percentage, 100);
  assert.equal(evalResult.masteryByShape.segitiga.percentage, 0);

  const badges = computeUnlockedBadges({
    exploredShapes: ['persegi', 'persegi-panjang', 'segitiga'],
    attempts: [
      {
        id: 'a1',
        completedAt: new Date().toISOString(),
        score: evalResult.score,
        correctCount: evalResult.correctCount,
        totalQuestions: evalResult.totalQuestions,
        maxStreak: evalResult.maxStreak,
        pointsEarned: evalResult.pointsEarned,
        rewardTier: evalResult.rewardTier,
        stars: evalResult.stars,
        masteryByShape: evalResult.masteryByShape,
      },
    ],
  });

  assert.ok(badges.includes('penjelajah-geometri'));
  assert.ok(badges.includes('ahli-persegi'));
  assert.ok(!badges.includes('juara-segitiga'));
  assert.ok(!badges.includes('nilai-sempurna'));
});

test('applies new attempt to student profile and keeps highest score & reward', () => {
  const student = SEED_STUDENTS[2]; // Citra (best 70, perunggu)
  const updated = applyAttemptToStudent(student, {
    id: 'att-new',
    completedAt: new Date().toISOString(),
    score: 90,
    correctCount: 9,
    totalQuestions: 10,
    maxStreak: 6,
    pointsEarned: 130,
    rewardTier: 'emas',
    stars: 3,
    masteryByShape: {
      persegi: { correct: 3, total: 3, percentage: 100 },
      'persegi-panjang': { correct: 3, total: 3, percentage: 100 },
      segitiga: { correct: 3, total: 4, percentage: 75 },
    },
  });

  assert.equal(updated.bestScore, 90);
  assert.equal(updated.highestReward, 'emas');
  assert.ok(updated.badges.includes('master-persegi-panjang'));
  assert.ok(updated.badges.includes('kilat-tepat'));
});

test('sorts leaderboard deterministically and exports valid CSV', () => {
  const sorted = sortLeaderboard(SEED_STUDENTS);
  assert.equal(sorted[0].id, 'student-alya');
  assert.equal(sorted[1].id, 'student-bima');
  assert.equal(sorted[2].id, 'student-citra');

  const csv = generateGradebookCsv(SEED_STUDENTS);
  const lines = csv.split('\n');
  assert.equal(lines.length, 4); // header + 3 students
  assert.ok(lines[0].includes('Nama Peserta Didik'));
  assert.ok(lines[1].includes('Alya Putri Ramadhani'));
});
