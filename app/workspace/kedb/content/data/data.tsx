import {
  CheckCircle2,
  Circle,
  FileText,
  Archive
} from "lucide-react";

export const statuses = [
  {
    value: "draft",
    label: "Draft",
    icon: Circle
  },
  {
    value: "published",
    label: "Published",
    icon: CheckCircle2
  },
  {
    value: "archived",
    label: "Archived",
    icon: Archive
  }
];

export const expertiseLevels = [
  {
    value: "beginner",
    label: "Beginner",
    icon: FileText
  },
  {
    value: "intermediate",
    label: "Intermediate",
    icon: FileText
  },
  {
    value: "advanced",
    label: "Advanced",
    icon: FileText
  },
  {
    value: "expert",
    label: "Expert",
    icon: FileText
  }
];
