import React from 'react';
import LeadershipBasePage from './LeadershipBasePage';

// Shows whichever leadership entries (any category) are flagged displayInHome.
const LeadersInHome = () => (
  <LeadershipBasePage
    homeOnly
    title="About"
    subtitle="Leadership entries currently featured on the home page."
    buttonText="New Entry"
    showCategoryColumn={true}
  />
);

export default LeadersInHome;
