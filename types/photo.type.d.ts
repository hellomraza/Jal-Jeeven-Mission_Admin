type Photo = {
  id: string;
  image_url: string;
  latitude: string;
  longitude: string;
  timestamp: string;
  employee_id: string;
  employee: Employee;
  component_id: string;
  work_item_id: string;
  workItemComponent: WorkItemComponent;
  workItem: WorkItem;
  is_selected: boolean;
  selected_by: string | null;
  selected_at: string | null;
  is_forwarded_to_do: boolean;
  forwarded_at: string | null;
  created_at: string;
};
