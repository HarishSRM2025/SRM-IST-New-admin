import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Institution from './pages/Institution';
import InstituteStats from './pages/InstituteStats';
import DeanMessage from './pages/DeanMessage';
import Infrastructure from './pages/Infrastructure';
import GalleryResource from './pages/GalleryResource';
import Schools from './pages/Schools';
import SchoolDivisions from './pages/SchoolDivisions';
import HODMessage from './pages/HODMessage';
import Programmes from './pages/Programmes';
import Achievements from './pages/Achievements';
import EventsAndActivities from './pages/EventsAndActivities';
import DivisionHODMessage from './pages/DivisionHODMessage';
import DivisionAchievements from './pages/DivisionAchievements';
import DivisionEventsAndActivities from './pages/DivisionEventsAndActivities';
import FacultyLayout from './pages/FacultyLayout';
import Faculty from './pages/Faculty';
import FacultyResearch from './pages/FacultyResearch';
import FacultyExperience from './pages/FacultyExperience';
import ResearchCenter from './pages/ResearchCenter';
import ResearchFacultyMembers from './pages/ResearchFacultyMembers';
import ResearchStudentMembers from './pages/ResearchStudentMembers';
import Slider from './pages/Slider';
import InstituteEventsAndActivities from './pages/InstituteEventsAndActivities';
import InstituteProgrammes from './pages/InstituteProgrammes';
import About from './pages/About';
import AboutRanking from './pages/AboutRanking';
import LeadersInHome from './pages/LeadersInHome';
import AcademicHeads from './pages/AcademicHeads';
import AdministrativeHeads from './pages/AdministrativeHeads';
import LeadershipMessage from './pages/LeadershipMessage';
import SchoolDivisionProgrammes from './pages/schoolDivisionProgrammes';
import StudentTestimonials from './pages/StudentTestimonials';
import UserManagement from './pages/UserManagement';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { signin, signup } from './api/auth';

const AUTH_STORAGE_KEY = 'srm_admin_session';
const USER_DATA_STORAGE_KEY = 'IST_USER_DATA';

function getStoredSession() {
  const savedSession = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);

  if (!savedSession) {
    return null;
  }

  try {
    return JSON.parse(savedSession);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function ProtectedAdmin({ isAuthenticated, onLogout, session }) {
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <AdminLayout onLogout={onLogout} session={session} />;
}

function SignInRoute({ isAuthenticated, onAuthSuccess }) {
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (formData) => {
    const result = await signin(formData);
    const storage = formData.remember ? localStorage : sessionStorage;
    const otherStorage = formData.remember ? sessionStorage : localStorage;
    const session = {
      id: result.user?._id,
      username: result.user?.username,
      email: result.user?.email || formData.email,
      role: result.user?.role,
      message: result.message,
      signedInAt: new Date().toISOString(),
    };

    otherStorage.removeItem(AUTH_STORAGE_KEY);
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    onAuthSuccess(session);
    navigate('/', { replace: true });
  };

  return (
    <SignIn
      onSignIn={handleSignIn}
      onNavigateToSignUp={() => navigate('/signup')}
    />
  );
}

function SignUpRoute({ isAuthenticated }) {
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSignUp = async (formData) => {
    await signup(formData);
    navigate('/signin', { replace: true });
  };

  return (
    <SignUp
      onSignUp={handleSignUp}
      onNavigateToSignIn={() => navigate('/signin')}
    />
  );
}

function App() {
  const [session, setSession] = useState(() => getStoredSession());

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_DATA_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setSession(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/signin"
          element={<SignInRoute isAuthenticated={Boolean(session)} onAuthSuccess={setSession} />}
        />
        <Route
          path="/signup"
          element={<SignUpRoute isAuthenticated={Boolean(session)} />}
        />
        <Route
          path="/"
          element={<ProtectedAdmin isAuthenticated={Boolean(session)} onLogout={handleLogout} session={session} />}
        >
          <Route index element={<Dashboard />} />
          <Route path="institution" element={<Institution />} />
          <Route path="institution/stats" element={<InstituteStats />} />
          <Route path="institution/dean-message" element={<DeanMessage />} />
          <Route path="institution/infrastructure" element={<Infrastructure />} />
          <Route path="institution/gallery-resource" element={<GalleryResource />} />
          <Route path="institution/events-and-activities" element={<InstituteEventsAndActivities />} />
          <Route path="institution/programmes" element={<InstituteProgrammes />} />
          <Route path="sliders" element={<Slider />} />
          <Route path="student-testimonials" element={<StudentTestimonials />} />
          <Route path="schools" element={<Schools />} />

          {/* About module: Accreditation | Ranking | Leaders In Home | Academic Heads | Administrative Heads | Leadership Message */}
          <Route path="about" element={<About />} />
          <Route path="about/ranking" element={<AboutRanking />} />
          <Route path="about/leaders-in-home" element={<LeadersInHome />} />
          <Route path="about/academic-heads" element={<AcademicHeads />} />
          <Route path="about/administrative-heads" element={<AdministrativeHeads />} />
          <Route path="about/leadership" element={<LeadershipMessage />} />

          <Route path="school-divisions" element={<SchoolDivisions />} />
          <Route path="school-divisions/hod-message" element={<DivisionHODMessage />} />
          <Route path="school-divisions/programmes" element={<SchoolDivisionProgrammes />} />
          <Route path="school-divisions/achievements" element={<DivisionAchievements />} />
          <Route path="school-divisions/events-and-activities" element={<DivisionEventsAndActivities />} />
          <Route path="schools/divisions" element={<SchoolDivisions />} />
          <Route path="schools/divisions/hod-message" element={<DivisionHODMessage />} />
          <Route path="schools/divisions/programmes" element={<SchoolDivisionProgrammes />} />
          <Route path="schools/divisions/achievements" element={<DivisionAchievements />} />
          <Route path="schools/divisions/events-and-activities" element={<DivisionEventsAndActivities />} />
          <Route path="schools/hod-message" element={<HODMessage />} />
          <Route path="schools/programmes" element={<Programmes />} />
          <Route path="schools/achievements" element={<Achievements />} />
          <Route path="schools/events-and-activities" element={<EventsAndActivities />} />
          <Route path="faculty" element={<FacultyLayout />}>
            <Route index element={<Faculty />} />
            <Route path="research" element={<FacultyResearch />} />
            <Route path="experience" element={<FacultyExperience />} />
          </Route>
          <Route path="research" element={<ResearchCenter />} />
          <Route path="research/faculty-members" element={<ResearchFacultyMembers />} />
          <Route path="research/student-members" element={<ResearchStudentMembers />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
        <Route path="*" element={<Navigate to={session ? "/" : "/signin"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
