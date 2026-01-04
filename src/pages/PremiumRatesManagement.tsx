import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Euro, Clock, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';

interface PremiumRate {
  id: string;
  duration_hours: number;
  price_euros: number;
  description?: string;
}

const PremiumRatesManagement = () => {
  const navigate = useNavigate();
  const { user, isPremium } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [rates, setRates] = useState<PremiumRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDuration, setNewDuration] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [addingRate, setAddingRate] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!isPremium) {
      navigate('/premium-subscription');
      return;
    }

    loadRates();
  }, [user, isPremium, navigate]);

  const loadRates = async () => {
    try {
      const { data, error } = await supabase
        .from('premium_rates')
        .select('*')
        .eq('user_id', user!.id)
        .order('duration_hours', { ascending: true });

      if (error) throw error;
      setRates(data || []);
    } catch (error) {
      console.error('Error loading rates:', error);
      toast({
        title: t('premiumRates.error'),
        description: t('premiumRates.loadError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const duration = parseInt(newDuration);
    const price = parseInt(newPrice);

    if (!duration || !price || duration <= 0 || price <= 0) {
      toast({
        title: t('premiumRates.error'),
        description: t('premiumRates.invalidValues'),
        variant: 'destructive',
      });
      return;
    }

    setAddingRate(true);

    try {
      const { error } = await supabase
        .from('premium_rates')
        .insert({
          user_id: user!.id,
          duration_hours: duration,
          price_euros: price,
          description: newDescription || null,
        });

      if (error) throw error;

      toast({
        title: t('premiumRates.rateAdded'),
        description: t('premiumRates.rateAddedDesc'),
      });

      setNewDuration('');
      setNewPrice('');
      setNewDescription('');
      loadRates();
    } catch (error) {
      console.error('Error adding rate:', error);
      toast({
        title: t('premiumRates.error'),
        description: t('premiumRates.addError'),
        variant: 'destructive',
      });
    } finally {
      setAddingRate(false);
    }
  };

  const handleDeleteRate = async (rateId: string) => {
    try {
      const { error } = await supabase
        .from('premium_rates')
        .delete()
        .eq('id', rateId);

      if (error) throw error;

      toast({
        title: t('premiumRates.rateDeleted'),
        description: t('premiumRates.rateDeletedDesc'),
      });

      loadRates();
    } catch (error) {
      console.error('Error deleting rate:', error);
      toast({
        title: t('premiumRates.error'),
        description: t('premiumRates.deleteError'),
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t('premiumRates.title')}</h1>
        </div>

        {/* Add Rate Form */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('premiumRates.addNewRate')}
          </h2>
          <form onSubmit={handleAddRate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">{t('premiumRates.duration')}</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder={t('premiumRates.durationPlaceholder')}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">{t('premiumRates.price')}</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    min="1"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder={t('premiumRates.pricePlaceholder')}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">
                {t('premiumRates.description')} <span className="text-muted-foreground text-xs">({t('premiumRates.optional')})</span>
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={t('premiumRates.descriptionPlaceholder')}
                  className="pl-10 min-h-[80px]"
                />
              </div>
            </div>
            <Button type="submit" disabled={addingRate} className="w-full">
              {addingRate ? t('premiumRates.adding') : t('premiumRates.addRate')}
            </Button>
          </form>
        </Card>

        {/* Rates List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t('premiumRates.yourRates')}</h2>
          {rates.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                {t('premiumRates.noRates')}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {rates.map((rate) => (
                <Card key={rate.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary" />
                          <span className="font-medium">{rate.duration_hours} {rate.duration_hours === 1 ? t('premiumRates.hour') : t('premiumRates.hours')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Euro className="w-5 h-5 text-primary" />
                          <span className="font-medium text-lg">{rate.price_euros}€</span>
                        </div>
                      </div>
                      {rate.description && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <p>{rate.description}</p>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteRate(rate.id)}
                      className="text-destructive hover:text-destructive flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2">{t('premiumRates.howItWorksTitle')}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• {t('premiumRates.howItWorks1')}</li>
            <li>• {t('premiumRates.howItWorks2')}</li>
            <li>• {t('premiumRates.howItWorks3')}</li>
            <li>• {t('premiumRates.howItWorks4')}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default PremiumRatesManagement;
