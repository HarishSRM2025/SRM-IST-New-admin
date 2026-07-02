import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
