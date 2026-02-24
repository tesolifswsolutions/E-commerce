import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Store, Package, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const benefits = [
  { icon: Users, title: 'Reach Thousands', desc: 'Connect with buyers actively searching for parts' },
  { icon: Package, title: 'Easy Listing', desc: 'Simple tools to list and manage your inventory' },
  { icon: TrendingUp, title: 'Grow Sales', desc: 'Track performance and optimize your listings' },
];

export default function SupplierRegister() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await base44.entities.Supplier.create({
      ...formData,
      status: 'pending',
      rating: 0,
      total_sales: 0
    });
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Application submitted successfully!');
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div 
          className="bg-white rounded-2xl p-8 max-w-lg w-full text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
          <p className="text-slate-600 mb-6">
            Thank you for your interest. Our team will review your application and get back to you within 24-48 hours.
          </p>
          <Link to={createPageUrl('Home')}>
            <Button className="w-full h-12 bg-slate-900 hover:bg-slate-800">
              Return to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-500 rounded-xl">
                <Store className="w-8 h-8 text-black" />
              </div>
              <span className="text-amber-400 font-medium">Become a Supplier</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Start Selling Your<br />
              <span className="text-amber-400">Spare Parts</span> Today
            </h1>
            
            <p className="text-lg text-slate-300 mb-10">
              Join our growing marketplace of trusted suppliers. List your used and new auto parts, 
              reach customers across the country, and grow your business.
            </p>
            
            <div className="space-y-6">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <benefit.icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{benefit.title}</h3>
                    <p className="text-slate-400 text-sm">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-0 shadow-2xl">
              <CardHeader>
                <CardTitle>Register as a Supplier</CardTitle>
                <CardDescription>Fill in your details to get started</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="business_name">Business Name *</Label>
                    <Input
                      id="business_name"
                      value={formData.business_name}
                      onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                      required
                      className="mt-1"
                      placeholder="Your auto parts shop name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="owner_name">Owner Name *</Label>
                    <Input
                      id="owner_name"
                      value={formData.owner_name}
                      onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                      required
                      className="mt-1"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="mt-1"
                        placeholder="business@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                        className="mt-1"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="mt-1"
                      placeholder="Street address"
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="mt-1"
                      placeholder="City"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-semibold mt-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                    ) : (
                      <>
                        Submit Application
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}