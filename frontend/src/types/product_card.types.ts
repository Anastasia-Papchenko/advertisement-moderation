export type AdCardProps = {
  image: string;       
  title: string;       
  price: number;        
  category: string;     
  createdAt: string;   
  status: 'pending' | 'approved' | 'rejected';
  priority: 'normal' | 'urgent';
};

export type ProductCardProps = AdCardProps & {
  showCheckbox?: boolean;
  checked?: boolean;
  onToggleCheckbox?: () => void;
};