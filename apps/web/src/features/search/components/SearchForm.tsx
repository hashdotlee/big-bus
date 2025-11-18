'use client';

/**
 * Search Form Component
 * Feature: Search
 */

import { useState } from 'react';
import { Button, Input, Card, CardContent } from '@big-bus/ui';
import { MapPin, Calendar, Users, Search } from 'lucide-react';

interface SearchFormProps {
  onSearch?: (data: SearchData) => void;
  defaultValues?: Partial<SearchData>;
}

export interface SearchData {
  from: string;
  to: string;
  date: string;
  passengers: number;
}

export const SearchForm = ({ onSearch, defaultValues }: SearchFormProps) => {
  const [formData, setFormData] = useState<SearchData>({
    from: defaultValues?.from || '',
    to: defaultValues?.to || '',
    date: defaultValues?.date || '',
    passengers: defaultValues?.passengers || 1,
  });

  const handleChange = (field: keyof SearchData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'passengers' ? parseInt(e.target.value) || 1 : e.target.value;
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(formData);
  };

  return (
    <Card variant="elevated" className="w-full">
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="From"
              placeholder="Departure city"
              leftIcon={<MapPin className="w-5 h-5" />}
              value={formData.from}
              onChange={handleChange('from')}
              required
              fullWidth
            />
            <Input
              label="To"
              placeholder="Destination city"
              leftIcon={<MapPin className="w-5 h-5" />}
              value={formData.to}
              onChange={handleChange('to')}
              required
              fullWidth
            />
            <Input
              label="Date"
              type="date"
              leftIcon={<Calendar className="w-5 h-5" />}
              value={formData.date}
              onChange={handleChange('date')}
              required
              fullWidth
            />
            <Input
              label="Passengers"
              type="number"
              min="1"
              max="10"
              leftIcon={<Users className="w-5 h-5" />}
              value={formData.passengers.toString()}
              onChange={handleChange('passengers')}
              required
              fullWidth
            />
          </div>
          <div className="mt-6">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              leftIcon={<Search className="w-5 h-5" />}
              fullWidth
            >
              Search Buses
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
