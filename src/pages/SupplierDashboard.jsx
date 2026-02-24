import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Package, DollarSign, Eye, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import VehicleTemplateSelector from '../components/supplier/VehicleTemplateSelector';

export default function SupplierDashboard() {
  const [user, setUser] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [isAddPartOpen, setIsAddPartOpen] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [selectedParentCategory, setSelectedParentCategory] = useState('');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    loadUserAndSupplier();
  }, []);

  const loadUserAndSupplier = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      
      const suppliers = await base44.entities.Supplier.filter({ email: u.email });
      if (suppliers.length > 0) {
        setSupplier(suppliers[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const { data: myParts = [], isLoading } = useQuery({
    queryKey: ['my-parts', supplier?.id],
    queryFn: () => base44.entities.SparePart.filter({ supplier_id: supplier.id }, '-created_date'),
    enabled: !!supplier?.id,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list('make'),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.PartCategory.list(),
  });

  React.useEffect(() => {
    if (editingPart?.category_id && categories.length > 0) {
      const savedCategory = categories.find(cat => cat.id === editingPart.category_id);
      if (savedCategory?.parent_category_id) {
        const parent = categories.find(cat => 
          !cat.parent_category_id && 
          (cat.id === savedCategory.parent_category_id || 
           cat.name?.toLowerCase().startsWith(savedCategory.parent_category_id))
        );
        if (parent) {
          setSelectedParentCategory(parent.id);
        }
      }
    } else if (!editingPart) {
      setSelectedParentCategory('');
    }
  }, [editingPart, categories]);

  const parentCategories = categories.filter(cat => !cat.parent_category_id);
  
  const selectedParent = parentCategories.find(cat => cat.id === selectedParentCategory);
  const parentName = selectedParent?.name?.toLowerCase().split(' ')[0];
  
  const subCategories = categories.filter(cat => 
    cat.parent_category_id && 
    (cat.parent_category_id === selectedParentCategory || cat.parent_category_id === parentName)
  );

  const createPartMutation = useMutation({
    mutationFn: (partData) => base44.entities.SparePart.create(partData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-parts'] });
      setIsAddPartOpen(false);
      setEditingPart(null);
      toast.success('Part added successfully');
    },
  });

  const updatePartMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SparePart.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-parts'] });
      setIsAddPartOpen(false);
      setEditingPart(null);
      toast.success('Part updated successfully');
    },
  });

  const deletePartMutation = useMutation({
    mutationFn: (id) => base44.entities.SparePart.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-parts'] });
      toast.success('Part deleted');
    },
  });

  const handleSubmitPart = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const categoryId = formData.get('category_id');
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    
    const partData = {
      name: formData.get('name'),
      part_number: formData.get('part_number'),
      description: formData.get('description'),
      supplier_id: supplier.id,
      supplier_name: supplier.business_name,
      category_id: categoryId,
      category_name: selectedCategory?.name || '',
      vehicle_make: formData.get('vehicle_make'),
      vehicle_model: formData.get('vehicle_model'),
      vehicle_variant: formData.get('vehicle_variant'),
      year_from: parseInt(formData.get('year_from')) || undefined,
      year_to: parseInt(formData.get('year_to')) || undefined,
      condition: formData.get('condition'),
      price: parseFloat(formData.get('price')),
      original_price: parseFloat(formData.get('original_price')) || undefined,
      quantity: parseInt(formData.get('quantity')) || 1,
      warranty_days: parseInt(formData.get('warranty_days')) || 0,
      images: formData.get('images') ? [formData.get('images')] : [],
      status: 'active',
    };

    if (editingPart) {
      updatePartMutation.mutate({ id: editingPart.id, data: partData });
    } else {
      createPartMutation.mutate(partData);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Supplier Account</h2>
          <p className="text-slate-600 mb-6">
            You need to register as a supplier before accessing this dashboard.
          </p>
          <Button onClick={() => window.location.href = '/SupplierRegister'}>
            Register as Supplier
          </Button>
        </div>
      </div>
    );
  }

  if (supplier.status === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Pending</h2>
          <p className="text-slate-600">
            Your supplier application is under review. You'll be able to add parts once approved by our admin team.
          </p>
        </div>
      </div>
    );
  }

  if (supplier.status === 'suspended') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Suspended</h2>
          <p className="text-slate-600">
            Your supplier account has been suspended. Please contact support for more information.
          </p>
        </div>
      </div>
    );
  }

  const totalRevenue = myParts.reduce((sum, part) => sum + (part.price * (part.quantity || 1)), 0);
  const activeParts = myParts.filter(p => p.status === 'active').length;
  const soldParts = myParts.filter(p => p.status === 'sold').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Supplier Dashboard</h1>
            <p className="text-slate-600 mt-1">Welcome back, {supplier.business_name}</p>
          </div>
          <Dialog open={isAddPartOpen} onOpenChange={setIsAddPartOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                <Plus className="w-5 h-5 mr-2" />
                Add New Part
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPart ? 'Edit Part' : 'Add New Part'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitPart} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Part Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingPart?.name}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="part_number">Part Number</Label>
                    <Input
                      id="part_number"
                      name="part_number"
                      defaultValue={editingPart?.part_number}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingPart?.description}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="parent_category">Category</Label>
                    <Select 
                      value={selectedParentCategory} 
                      onValueChange={(value) => setSelectedParentCategory(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {parentCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category_id">Subcategory</Label>
                    <Select name="category_id" defaultValue={editingPart?.category_id}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {subCategories.length > 0 ? (
                          subCategories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value={null} disabled>Select a category first</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <Select name="condition" defaultValue={editingPart?.condition || 'used_good'} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="used_excellent">Used - Excellent</SelectItem>
                        <SelectItem value="used_good">Used - Good</SelectItem>
                        <SelectItem value="used_fair">Used - Fair</SelectItem>
                        <SelectItem value="refurbished">Refurbished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <VehicleTemplateSelector
                  vehicles={vehicles}
                  defaultMake={editingPart?.vehicle_make}
                  defaultModel={editingPart?.vehicle_model}
                  defaultVariant={editingPart?.vehicle_variant}
                  defaultYearFrom={editingPart?.year_from}
                  defaultYearTo={editingPart?.year_to}
                />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($) *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingPart?.price}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="original_price">Original Price ($)</Label>
                    <Input
                      id="original_price"
                      name="original_price"
                      type="number"
                      step="0.01"
                      defaultValue={editingPart?.original_price}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      defaultValue={editingPart?.quantity || 1}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="warranty_days">Warranty (days)</Label>
                  <Input
                    id="warranty_days"
                    name="warranty_days"
                    type="number"
                    defaultValue={editingPart?.warranty_days || 0}
                  />
                </div>

                <div>
                  <Label htmlFor="images">Image URL</Label>
                  <Input
                    id="images"
                    name="images"
                    defaultValue={editingPart?.images?.[0]}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAddPartOpen(false);
                    setEditingPart(null);
                  }}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black">
                    {editingPart ? 'Update Part' : 'Add Part'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Parts</CardTitle>
              <Package className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeParts}</div>
              <p className="text-xs text-slate-500 mt-1">{myParts.length} total parts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Parts Sold</CardTitle>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{soldParts}</div>
              <p className="text-xs text-slate-500 mt-1">Total sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Views</CardTitle>
              <Eye className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {myParts.reduce((sum, p) => sum + (p.views || 0), 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Across all parts</p>
            </CardContent>
          </Card>
        </div>

        {/* Parts List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Parts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : myParts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">No parts added yet</p>
                <Button onClick={() => setIsAddPartOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-black">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Part
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myParts.map((part) => (
                  <div key={part.id} className="border rounded-lg p-4 flex items-center gap-4 bg-white">
                    <img
                      src={part.images?.[0] || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100&h=100&fit=crop'}
                      alt={part.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{part.name}</h3>
                        <Badge className={
                          part.status === 'active' ? 'bg-green-100 text-green-800' :
                          part.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-800'
                        }>
                          {part.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        {part.vehicle_make} {part.vehicle_model} • {part.part_number}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-semibold text-slate-900">${part.price?.toLocaleString()}</span>
                        <span className="text-slate-500">{part.views || 0} views</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPart(part);
                          setIsAddPartOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this part?')) {
                            deletePartMutation.mutate(part.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}