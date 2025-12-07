import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, MapPin, Save, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/hooks/user/useUser';
import { useUpdateUser } from '@/hooks/user/useUpdateUser';
import { useDeleteUser } from '@/hooks/user/useDeleteUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const { data: user, isLoading: isLoadingUser } = useUser(authUser?.id || '');
  const updateMutation = useUpdateUser(authUser?.id || '');
  const deleteMutation = useDeleteUser(authUser?.id || '');
  
  const [name, setName] = useState('');
  const [cep, setCep] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Sync form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCep(user.cep || '');
    }
  }, [user]);

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCep(formatCep(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await updateMutation.mutateAsync({ name, cep });
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao atualizar perfil.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteMutation.mutateAsync();
      logout();
      navigate('/login');
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erro ao excluir conta. Tente novamente.' });
    }
  };

  const displayUser = user || authUser;

  if (isLoadingUser) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Perfil" subtitle="Gerencie suas informações" />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Perfil" subtitle="Gerencie suas informações" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Card */}
          <Card className="glass-card animate-slide-up">
            <CardContent className="pt-8">
              {/* Avatar */}
              <div className="flex justify-center mb-8">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="weather-gradient text-primary-foreground text-2xl">
                    {displayUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Messages */}
              {message && (
                <Alert 
                  variant={message.type === 'error' ? 'destructive' : 'default'}
                  className={`mb-6 animate-fade-in ${
                    message.type === 'success' 
                      ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
                      : ''
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      placeholder={`${displayUser?.name || 'Seu nome completo'}`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={displayUser?.email || ''}
                      className="pl-10 bg-muted cursor-not-allowed"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="cep"
                      type="text"
                      value={cep}
                      onChange={handleCepChange}
                      className="pl-10"
                      placeholder={`${displayUser?.cep || '00000-000'}`}
                      required
                      maxLength={9}
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={deleteMutation.isPending}
                    className="flex items-center justify-center gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir Conta
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card className="glass-card animate-slide-up stagger-1">
            <CardHeader>
              <CardTitle className="text-lg">Informações da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {/* <div className="flex justify-between">
                <span className="text-muted-foreground">ID do Usuário</span>
                <span className="text-foreground font-mono">{displayUser?.id}</span>
              </div> */}
              {/* <Separator /> */}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Localização</span>
                <span className="text-foreground">{formatCep(displayUser?.cep || '')}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Membro desde</span>
                <span className="text-foreground">
                  {displayUser?.created_at 
                    ? new Date(displayUser.created_at).toLocaleDateString('pt-BR', { 
                        day: 'numeric',
                        year: 'numeric', 
                        month: 'long' 
                      })
                    : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.
              Todos os seus dados serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Excluindo...' : 'Excluir Conta'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
