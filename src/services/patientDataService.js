/**
 * Patient & assessment data — SQLite API first, localStorage fallback.
 */
import dataApi, { checkDataApiHealth } from './dataApi';

const KEYS = {
  PATIENTS: 'ir_patients',
  ASSESSMENTS: 'ir_assessments',
  LEGACY_ASSESSMENTS: 'assessments',
};

let apiAvailable = null;

const readJson = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const isApiReady = async () => {
  if (apiAvailable === null) {
    apiAvailable = await checkDataApiHealth();
  }
  return apiAvailable;
};

export const resetApiCheck = () => {
  apiAvailable = null;
};

const migrateLegacyAssessments = () => {
  const legacy = readJson(KEYS.LEGACY_ASSESSMENTS);
  if (!legacy.length) return;
  const assessments = readJson(KEYS.ASSESSMENTS);
  const patients = readJson(KEYS.PATIENTS);
  const defaultUserId = patients[0]?.userId || 'legacy-user';
  legacy.forEach((item) => {
    if (assessments.some((a) => a.id === item.id)) return;
    assessments.push({ ...item, userId: item.userId || defaultUserId });
  });
  writeJson(KEYS.ASSESSMENTS, assessments);
  localStorage.removeItem(KEYS.LEGACY_ASSESSMENTS);
};

migrateLegacyAssessments();

const patientDataService = {
  async upsertPatient({ userId, name, email, phone = '', dateOfBirth = '', notes = '' }) {
    const now = new Date().toISOString();
    const record = {
      userId: String(userId),
      name,
      email,
      phone,
      dateOfBirth,
      notes,
      updatedAt: now,
      createdAt: now,
    };
    if (!(await isApiReady())) {
      const patients = readJson(KEYS.PATIENTS);
      const idx = patients.findIndex((p) => p.userId === String(userId));
      if (idx >= 0) {
        record.createdAt = patients[idx].createdAt;
        patients[idx] = { ...patients[idx], ...record };
      } else patients.push(record);
      writeJson(KEYS.PATIENTS, patients);
      return record;
    }
    return record;
  },

  async getPatientByUserId(userId) {
    if (await isApiReady()) {
      try {
        const { user } = await dataApi.me();
        if (String(user.userId) === String(userId)) {
          return {
            userId: user.userId,
            name: user.name,
            email: user.email,
            phone: user.phone,
            dateOfBirth: user.dateOfBirth,
            notes: user.notes,
          };
        }
      } catch {
        /* ignore */
      }
    }
    return readJson(KEYS.PATIENTS).find((p) => p.userId === String(userId)) || null;
  },

  async saveAssessment(userId, assessment) {
    const payload = {
      ...assessment,
      userId: String(userId),
      date: assessment.date || new Date().toISOString(),
    };

    if (await isApiReady()) {
      try {
        return await dataApi.saveAssessment(payload);
      } catch (e) {
        console.warn('API save failed, using local storage:', e.message);
        apiAvailable = false;
      }
    }

    const patients = readJson(KEYS.PATIENTS);
    const patient = patients.find((p) => p.userId === String(userId));
    const record = {
      ...payload,
      id: payload.id || Date.now(),
      patientEmail: patient?.email,
      patientName: patient?.name,
    };
    const assessments = readJson(KEYS.ASSESSMENTS);
    assessments.unshift(record);
    writeJson(KEYS.ASSESSMENTS, assessments);
    return record;
  },

  async getAssessmentsForUser(userId) {
    if (await isApiReady()) {
      try {
        return await dataApi.getAssessments(userId);
      } catch (e) {
        console.warn('API load assessments failed:', e.message);
        apiAvailable = false;
      }
    }
    return readJson(KEYS.ASSESSMENTS)
      .filter((a) => String(a.userId) === String(userId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async getAllPatients() {
    if (await isApiReady()) {
      try {
        return await dataApi.getAdminPatients();
      } catch (e) {
        console.warn('API admin patients failed:', e.message);
        apiAvailable = false;
      }
    }
    const patients = readJson(KEYS.PATIENTS);
    const assessments = readJson(KEYS.ASSESSMENTS);
    return patients
      .map((p) => {
        const patientAssessments = assessments
          .filter((a) => a.userId === p.userId)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        const latest = patientAssessments[0];
        return {
          ...p,
          assessmentCount: patientAssessments.length,
          latestRisk: latest?.riskLevel || '—',
          latestScore: latest?.riskScore ?? null,
          latestDate: latest?.date || null,
        };
      })
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
  },

  async getAllAssessments() {
    if (await isApiReady()) {
      try {
        return await dataApi.getAssessments();
      } catch {
        apiAvailable = false;
      }
    }
    return readJson(KEYS.ASSESSMENTS).sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  async deleteAssessment(assessmentId) {
    if (await isApiReady()) {
      try {
        await dataApi.deleteAssessment(assessmentId);
        return;
      } catch {
        apiAvailable = false;
      }
    }
    writeJson(
      KEYS.ASSESSMENTS,
      readJson(KEYS.ASSESSMENTS).filter((a) => a.id !== assessmentId)
    );
  },

  async deletePatient(userId) {
    if (await isApiReady()) {
      try {
        await dataApi.deletePatient(userId);
        return;
      } catch {
        apiAvailable = false;
      }
    }
    writeJson(KEYS.PATIENTS, readJson(KEYS.PATIENTS).filter((p) => p.userId !== userId));
    writeJson(
      KEYS.ASSESSMENTS,
      readJson(KEYS.ASSESSMENTS).filter((a) => a.userId !== userId)
    );
  },

  async getAdminStats() {
    if (await isApiReady()) {
      try {
        return await dataApi.getAdminStats();
      } catch {
        apiAvailable = false;
      }
    }
    const patients = readJson(KEYS.PATIENTS);
    const assessments = readJson(KEYS.ASSESSMENTS);
    const highRisk = assessments.filter((a) =>
      (a.riskLevel || '').toLowerCase().includes('high')
    ).length;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = assessments.filter((a) => new Date(a.date) >= weekAgo).length;
    return {
      totalPatients: patients.length,
      totalAssessments: assessments.length,
      highRiskCount: highRisk,
      assessmentsThisWeek: thisWeek,
    };
  },

  async exportAllData() {
    if (await isApiReady()) {
      try {
        return await dataApi.exportAll();
      } catch {
        apiAvailable = false;
      }
    }
    return {
      exportedAt: new Date().toISOString(),
      patients: readJson(KEYS.PATIENTS),
      assessments: readJson(KEYS.ASSESSMENTS),
    };
  },
};

export default patientDataService;
