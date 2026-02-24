import React, { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export default function SupplierMultiSelect({ suppliers, selectedSuppliers, onSelectionChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredSuppliers = suppliers.filter(s => 
    s.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.city?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSupplier = (supplier) => {
    const isSelected = selectedSuppliers.some(s => s.id === supplier.id);
    if (isSelected) {
      onSelectionChange(selectedSuppliers.filter(s => s.id !== supplier.id));
    } else {
      onSelectionChange([...selectedSuppliers, supplier]);
    }
  };

  const removeSupplier = (supplierId) => {
    onSelectionChange(selectedSuppliers.filter(s => s.id !== supplierId));
  };

  const clearAll = () => {
    onSelectionChange([]);
    setSearch('');
  };

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10"
          >
            <div className="flex flex-wrap gap-1">
              {selectedSuppliers.length === 0 ? (
                <span className="text-slate-500">Select suppliers to filter...</span>
              ) : (
                selectedSuppliers.map(supplier => (
                  <Badge key={supplier.id} variant="secondary" className="gap-1">
                    {supplier.business_name} • {supplier.city}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSupplier(supplier.id);
                      }}
                    />
                  </Badge>
                ))
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
          <div className="p-2 border-b">
            <Input
              placeholder="Search by name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredSuppliers.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-500">
                No suppliers found
              </div>
            ) : (
              filteredSuppliers.map((supplier) => {
                const isSelected = selectedSuppliers.some(s => s.id === supplier.id);
                return (
                  <div
                    key={supplier.id}
                    className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-slate-100"
                    onClick={() => toggleSupplier(supplier)}
                  >
                    <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-slate-900 border-slate-900' : 'border-slate-300'}`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 text-sm">
                      <span className="font-medium">{supplier.business_name}</span>
                      <span className="text-slate-500"> • {supplier.city}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {selectedSuppliers.length > 0 && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={clearAll}
              >
                Clear all
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}