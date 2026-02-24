import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, X, Users, Package, ShoppingBag, TrendingUp, Search, Eye, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import VehicleManager from '../components/admin/VehicleManager';
import SupplierMultiSelect from '../components/admin/SupplierMultiSelect';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => base44.entities.Supplier.list('-created_date'),
  });

  const { data: parts = [] } = useQuery({
    queryKey: ['all-parts'],
    queryFn: () => base44.entities.SparePart.list('-created_date'),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  const { data: supplierParts = [], isLoading: isLoadingParts } = useQuery({
    queryKey: ['supplier-parts', selectedSupplier?.id],
    queryFn: () => base44.entities.SparePart.filter({ supplier_id: selectedSupplier.id }),
    enabled: !!selectedSupplier?.id,
  });

  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Supplier.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Supplier status updated');
    },
  });

  const filterSuppliers = (supplierList) => {
    if (!searchQuery) return supplierList;
    const query = searchQuery.toLowerCase();
    return supplierList.filter(s => 
      s.business_name?.toLowerCase().includes(query) ||
      s.email?.toLowerCase().includes(query) ||
      s.city?.toLowerCase().includes(query)
    );
  };

  const pendingSuppliers = filterSuppliers(suppliers.filter(s => s.status === 'pending'));
  const approvedSuppliers = filterSuppliers(suppliers.filter(s => s.status === 'approved'));
  const suspendedSuppliers = filterSuppliers(suppliers.filter(s => s.status === 'suspended'));

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const activeParts = parts.filter(p => p.status === 'active').length;

  // Filter parts by selected suppliers
  const selectedSupplierIds = selectedSuppliers.map(s => s.id);
  const filteredParts = selectedSupplierIds.length > 0
    ? parts.filter(p => selectedSupplierIds.includes(p.supplier_id))
    : [];

  // Sold parts with revenue
  const soldParts = filteredParts.filter(p => p.status === 'sold');
  const soldPartsRevenue = soldParts.reduce((sum, p) => sum + (p.price || 0), 0);

  // Listed parts with projected revenue
  const listedParts = filteredParts.filter(p => p.status === 'active');
  const projectedRevenue = listedParts.reduce((sum, p) => sum + (p.price || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage suppliers, parts, and orders</p>
        </div>

        {/* Supplier Filter */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter by Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <SupplierMultiSelect
              suppliers={suppliers.filter(s => s.status === 'approved')}
              selectedSuppliers={selectedSuppliers}
              onSelectionChange={setSelectedSuppliers}
            />
          </CardContent>
        </Card>

        {/* Filtered Results */}
        {selectedSuppliers.length > 0 && (
          <div className="mb-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Sold Parts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-sm font-medium text-slate-600">Total Revenue</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${soldPartsRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {soldParts.length} parts sold
                    </div>
                    {soldParts.length > 0 ? (
                      <div className="space-y-2 mt-4 max-h-64 overflow-y-auto">
                        {soldParts.map(part => (
                          <div key={part.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{part.name}</p>
                              <p className="text-xs text-slate-500">{part.vehicle_make} {part.vehicle_model}</p>
                            </div>
                            <span className="text-sm font-semibold text-green-600">
                              ${part.price?.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">No sold parts yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Currently Listed Parts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-sm font-medium text-slate-600">Projected Revenue</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ${projectedRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-slate-500">
                      {listedParts.length} active parts
                    </div>
                    {listedParts.length > 0 ? (
                      <div className="space-y-2 mt-4 max-h-64 overflow-y-auto">
                        {listedParts.map(part => (
                          <div key={part.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{part.name}</p>
                              <p className="text-xs text-slate-500">{part.vehicle_make} {part.vehicle_model}</p>
                            </div>
                            <span className="text-sm font-semibold text-blue-600">
                              ${part.price?.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">No active parts</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Suppliers</CardTitle>
              <Users className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suppliers.length}</div>
              <p className="text-xs text-slate-500 mt-1">
                {pendingSuppliers.length} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Parts</CardTitle>
              <Package className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeParts}</div>
              <p className="text-xs text-slate-500 mt-1">
                {parts.length} total parts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Orders</CardTitle>
              <ShoppingBag className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-slate-500 mt-1">
                All time orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Revenue</CardTitle>
              <TrendingUp className="w-4 h-4 text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">
                Total platform revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Management */}
        <div className="mb-8">
          <VehicleManager />
        </div>

        {/* Supplier Management */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Applications</CardTitle>
            <div className="mt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search suppliers by name, email, or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="pending">
                  Pending ({pendingSuppliers.length})
                </TabsTrigger>
                <TabsTrigger value="approved">
                  Approved ({approvedSuppliers.length})
                </TabsTrigger>
                <TabsTrigger value="suspended">
                  Suspended ({suspendedSuppliers.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : pendingSuppliers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    {searchQuery ? (
                      <>
                        <p>No pending suppliers found for "{searchQuery}"</p>
                        <Button 
                          variant="link" 
                          onClick={() => setSearchQuery('')}
                          className="mt-2"
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      'No pending applications'
                    )}
                  </div>
                ) : (
                  pendingSuppliers.map((supplier) => (
                    <div key={supplier.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {supplier.logo_url ? (
                              <img 
                                src={supplier.logo_url} 
                                alt="" 
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                                <Users className="w-6 h-6 text-slate-400" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-slate-900">
                                {supplier.business_name}
                              </h3>
                              <p className="text-sm text-slate-500">{supplier.owner_name}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                            <div>
                              <span className="text-slate-500">Email:</span>{' '}
                              <span className="font-medium">{supplier.email}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Phone:</span>{' '}
                              <span className="font-medium">{supplier.phone}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">City:</span>{' '}
                              <span className="font-medium">{supplier.city}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Address:</span>{' '}
                              <span className="font-medium">{supplier.address}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateSupplierMutation.mutate({ 
                              id: supplier.id, 
                              status: 'approved' 
                            })}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateSupplierMutation.mutate({ 
                              id: supplier.id, 
                              status: 'suspended' 
                            })}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-4">
                {approvedSuppliers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    {searchQuery ? (
                      <>
                        <p>No approved suppliers found for "{searchQuery}"</p>
                        <Button 
                          variant="link" 
                          onClick={() => setSearchQuery('')}
                          className="mt-2"
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      'No approved suppliers yet'
                    )}
                  </div>
                ) : (
                  approvedSuppliers.map((supplier) => (
                    <div key={supplier.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {supplier.logo_url ? (
                            <img 
                              src={supplier.logo_url} 
                              alt="" 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                              <Users className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {supplier.business_name}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {supplier.email} • {supplier.city}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSupplier(supplier)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Parts
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSupplierMutation.mutate({ 
                              id: supplier.id, 
                              status: 'suspended' 
                            })}
                          >
                            Suspend
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="suspended" className="space-y-4">
                {suspendedSuppliers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    {searchQuery ? (
                      <>
                        <p>No suspended suppliers found for "{searchQuery}"</p>
                        <Button 
                          variant="link" 
                          onClick={() => setSearchQuery('')}
                          className="mt-2"
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      'No suspended suppliers'
                    )}
                  </div>
                ) : (
                  suspendedSuppliers.map((supplier) => (
                    <div key={supplier.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {supplier.logo_url ? (
                            <img 
                              src={supplier.logo_url} 
                              alt="" 
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                              <Users className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {supplier.business_name}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {supplier.email} • {supplier.city}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-red-100 text-red-800">Suspended</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSupplierMutation.mutate({ 
                              id: supplier.id, 
                              status: 'approved' 
                            })}
                          >
                            Reactivate
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Supplier Parts Dialog */}
        <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedSupplier?.business_name} - Parts Overview
              </DialogTitle>
            </DialogHeader>
            
            {isLoadingParts ? (
              <div className="text-center py-8">Loading parts...</div>
            ) : supplierParts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No parts listed yet
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600">
                        {supplierParts.filter(p => p.status === 'active').length}
                      </div>
                      <p className="text-sm text-slate-600">Active Parts</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-blue-600">
                        {supplierParts.filter(p => p.status === 'sold').length}
                      </div>
                      <p className="text-sm text-slate-600">Parts Sold</p>
                    </CardContent>
                  </Card>
                </div>

                <Tabs defaultValue="active">
                  <TabsList>
                    <TabsTrigger value="active">
                      Active Parts ({supplierParts.filter(p => p.status === 'active').length})
                    </TabsTrigger>
                    <TabsTrigger value="sold">
                      Sold Parts ({supplierParts.filter(p => p.status === 'sold').length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="active" className="space-y-3 mt-4">
                    {supplierParts.filter(p => p.status === 'active').map(part => (
                      <div key={part.id} className="border rounded-lg p-4 flex items-center gap-4">
                        <img
                          src={part.images?.[0] || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=80&h=80&fit=crop'}
                          alt={part.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{part.name}</h4>
                          <p className="text-sm text-slate-500">
                            {part.vehicle_make} {part.vehicle_model} • {part.condition}
                          </p>
                          <p className="text-sm font-semibold text-slate-900 mt-1">
                            ${part.price?.toLocaleString()} • {part.views || 0} views
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    ))}
                    {supplierParts.filter(p => p.status === 'active').length === 0 && (
                      <p className="text-center py-4 text-slate-500">No active parts</p>
                    )}
                  </TabsContent>

                  <TabsContent value="sold" className="space-y-3 mt-4">
                    {supplierParts.filter(p => p.status === 'sold').map(part => (
                      <div key={part.id} className="border rounded-lg p-4 flex items-center gap-4 opacity-75">
                        <img
                          src={part.images?.[0] || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=80&h=80&fit=crop'}
                          alt={part.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{part.name}</h4>
                          <p className="text-sm text-slate-500">
                            {part.vehicle_make} {part.vehicle_model} • {part.condition}
                          </p>
                          <p className="text-sm font-semibold text-slate-900 mt-1">
                            ${part.price?.toLocaleString()}
                          </p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Sold</Badge>
                      </div>
                    ))}
                    {supplierParts.filter(p => p.status === 'sold').length === 0 && (
                      <p className="text-center py-4 text-slate-500">No sold parts</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}