export interface AnniversaryItem {
  id: string;
  coupleId: string;
  title: string;
  date: string;
  icon: string;
  repeat: "yearly" | "monthly" | "once";
  notify: boolean;
}
