'use client';

import { useState, useEffect } from 'react';
import { PromotionsStats } from '@/components/admin/promotions/PromotionsStats';
import { PromotionsTable } from '@/components/admin/promotions/PromotionsTable';
import { PromotionModal } from '@/components/admin/promotions/PromotionModal';

export default function PromotionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
 
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#0f172a] mb-2">
          Khuyến Mãi / Mã Giảm Giá
        </h1>
        <p className="text-gray-500 text-sm">
          Tạo và quản lý mã giảm giá và chương trình khuyến mãi
        </p>
      </div>

      <PromotionsStats />
      
      <PromotionsTable 
        isLoading={isLoading} 
        onOpenModal={() => setIsModalOpen(true)} 
      />

      <PromotionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
