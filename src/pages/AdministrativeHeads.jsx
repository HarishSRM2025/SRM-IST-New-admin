import React from 'react';
import LeadershipBasePage from './LeadershipBasePage';

// Scoped strictly to category = "Administrative Heads".
const AdministrativeHeads = () => (
  <LeadershipBasePage
    lockedCategory="Administrative Heads"
    title="About"
    subtitle="Manage Administrative Heads featured under Leadership."
    buttonText="New Administrative Head"
    showCategoryColumn={false}
  />
);

export default AdministrativeHeads;
