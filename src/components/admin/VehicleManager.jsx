import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, Car } from 'lucide-react';
import { toast } from 'sonner';

export default function VehicleManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const queryClient = useQueryClient();

  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Vehicle.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle added successfully');
      setDialogOpen(false);
      setEditingVehicle(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Vehicle.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle updated successfully');
      setDialogOpen(false);
      setEditingVehicle(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Vehicle.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle deleted successfully');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      make: formData.get('make'),
      model: formData.get('model'),
      variant: formData.get('variant') || '',
      year_start: parseInt(formData.get('year_start')) || undefined,
      year_end: parseInt(formData.get('year_end')) || undefined,
      body_type: formData.get('body_type') || undefined,
    };

    if (editingVehicle) {
      updateMutation.mutate({ id: editingVehicle.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this vehicle?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5" />
          Vehicle Management
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingVehicle(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <Plus className="w-4 h-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    name="make"
                    defaultValue={editingVehicle?.make}
                    placeholder="e.g., Toyota"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    name="model"
                    defaultValue={editingVehicle?.model}
                    placeholder="e.g., Camry"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="variant">Variant</Label>
                  <Input
                    id="variant"
                    name="variant"
                    defaultValue={editingVehicle?.variant}
                    placeholder="e.g., SE, LX"
                  />
                </div>
                <div>
                  <Label htmlFor="body_type">Body Type</Label>
                  <Select name="body_type" defaultValue={editingVehicle?.body_type || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select body type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="hatchback">Hatchback</SelectItem>
                      <SelectItem value="truck">Truck</SelectItem>
                      <SelectItem value="coupe">Coupe</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="wagon">Wagon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year_start">Year Start</Label>
                  <Input
                    id="year_start"
                    name="year_start"
                    type="number"
                    defaultValue={editingVehicle?.year_start}
                    placeholder="e.g., 2015"
                  />
                </div>
                <div>
                  <Label htmlFor="year_end">Year End</Label>
                  <Input
                    id="year_end"
                    name="year_end"
                    type="number"
                    defaultValue={editingVehicle?.year_end}
                    placeholder="e.g., 2023"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-black">
                  {editingVehicle ? 'Update' : 'Add'} Vehicle
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {vehicles.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No vehicles added yet. Click "Add Vehicle" to get started.
            </div>
          ) : (
            vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-slate-900">
                      {vehicle.make} {vehicle.model}
                    </h4>
                    {vehicle.variant && (
                      <Badge variant="outline">{vehicle.variant}</Badge>
                    )}
                    {vehicle.body_type && (
                      <Badge className="bg-blue-100 text-blue-800">{vehicle.body_type}</Badge>
                    )}
                  </div>
                  {(vehicle.year_start || vehicle.year_end) && (
                    <p className="text-sm text-slate-600 mt-1">
                      Years: {vehicle.year_start || '?'} - {vehicle.year_end || 'Present'}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(vehicle)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(vehicle.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}