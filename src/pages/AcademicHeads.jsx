import React from 'react';
import LeadershipBasePage from './LeadershipBasePage';

// Scoped strictly to category = "Academic Heads".
const AcademicHeads = () => (
  <LeadershipBasePage
    lockedCategory="Academic Heads"
    title="About"
    subtitle="Manage Academic Heads featured under Leadership."
    buttonText="New Academic Head"
    showCategoryColumn={false}
  />
);

export default AcademicHeads;
