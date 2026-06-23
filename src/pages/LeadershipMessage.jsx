import React from 'react';
import LeadershipBasePage from './LeadershipBasePage';

// Unfiltered view across all categories — the master list of every
// leadership message (Founder, Chairman, Vice Chairman, Academic Heads,
// Administrative Heads) in one place.
const LeadershipMessage = () => (
  <LeadershipBasePage
    title="About"
    subtitle="Manage leadership across all categories."
    buttonText="New Leadership Entry"
    showCategoryColumn={true}
  />
);

export default LeadershipMessage;
