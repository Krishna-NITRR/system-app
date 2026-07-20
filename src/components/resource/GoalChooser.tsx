import { useNavigate } from 'react-router-dom';
import { goals } from '../../config/goals';
import { copy } from '../../config/copy';
import { useLeadContext } from '../../hooks/useLeadContext';
import { supabase } from '../../supabaseClient';

export default function GoalChooser() {
  const navigate = useNavigate();
  const { lead, setLead } = useLeadContext();

  const handleGoalSelect = async (goalId: string) => {
    setLead({ goalId });

    if (lead?.email) {
      try {
        await supabase
          .from('leads')
          .update({ goal_id: goalId })
          .match({ email: lead.email, resource: lead.resourceSlug });
      } catch (err) {
        console.error('Failed to update goal in DB', err);
      }
    }

    navigate(`/book?goal=${goalId}`);
  };

  return (
    <div className="goal-chooser">
      <h2>{copy.delivery.goalChooserHeading}</h2>
      <div className="goal-chooser-grid fade">
        {goals.map((goal) => (
          <div 
            key={goal.id} 
            className="goal-card"
            onClick={() => handleGoalSelect(goal.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleGoalSelect(goal.id);
              }
            }}
          >
            <div className="goal-card-header">
              <span className="goal-icon">{goal.icon}</span>
              <span className="goal-label">{goal.label}</span>
            </div>
            <p className="goal-desc">{goal.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
