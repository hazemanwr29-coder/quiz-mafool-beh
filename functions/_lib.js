export const TOTAL_QUESTIONS = 40;

// Server-side answer key. The browser sends only the selected option index.
export const ANSWER_KEY = [1, 0, 1, 2, 1, 1, 2, 2, 1, 1, 1, 2, 2, 0, 1, 2, 0, 2, 1, 1, 0, 0, 1, 2, 1, 1, 0, 2, 1, 0, 2, 1, 1, 0, 1, 1, 1, 0, 2, 1];

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export function normalizeName(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

export function validTeacherPassword(password, env) {
  return Boolean(env.TEACHER_PASSWORD) && typeof password === 'string' && password === env.TEACHER_PASSWORD;
}

export function calculateResult(rawAnswers) {
  const answers = Array.isArray(rawAnswers) ? rawAnswers : [];
  const answerMap = new Map();

  for (const item of answers) {
    const qid = Number(item?.questionId);
    const selected = Number(item?.selectedOptionIndex);
    if (
      Number.isInteger(qid) && qid >= 1 && qid <= TOTAL_QUESTIONS &&
      Number.isInteger(selected) && selected >= 0 && selected <= 3
    ) {
      answerMap.set(qid, selected);
    }
  }

  let score = 0;
  const normalizedAnswers = [];
  const mistakeIds = [];

  for (let qid = 1; qid <= TOTAL_QUESTIONS; qid++) {
    const selected = answerMap.get(qid);
    const expected = ANSWER_KEY[qid - 1];
    const answered = Number.isInteger(selected);
    const isCorrect = answered && selected === expected;

    if (isCorrect) score++;
    if (!isCorrect) mistakeIds.push(qid);

    normalizedAnswers.push({
      questionId: qid,
      selectedOptionIndex: answered ? selected : null,
      isCorrect
    });
  }

  return {
    score,
    total: TOTAL_QUESTIONS,
    percentage: Math.round((score / TOTAL_QUESTIONS) * 100),
    answers: normalizedAnswers,
    mistakeIds
  };
}

export async function getThreshold(env) {
  const row = await env.DB.prepare('SELECT value FROM settings WHERE key = ?1').bind('cert_threshold').first();
  const value = Number(row?.value);
  return Number.isFinite(value) && value >= 50 && value <= 100 ? value : 95;
}

export function toLog(row) {
  return {
    id: row.id,
    name: row.name,
    timestamp: row.timestamp,
    score: Number(row.score),
    total: Number(row.total),
    percentage: Number(row.percentage),
    attemptNumber: Number(row.attemptNumber || 1)
  };
}

export function buildDashboard(rows, threshold) {
  const counters = new Map();
  const logs = rows.map((row) => {
    const key = normalizeName(row.name).toLocaleLowerCase('ar');
    const next = (counters.get(key) || 0) + 1;
    counters.set(key, next);
    return toLog({ ...row, attemptNumber: next });
  });

  const missedStats = {};
  for (const row of rows) {
    let ids = [];
    try { ids = JSON.parse(row.mistake_ids_json || '[]'); } catch { ids = []; }
    for (const id of ids) {
      const key = String(id);
      missedStats[key] = (missedStats[key] || 0) + 1;
    }
  }

  return { logs, missedStats, threshold };
}
