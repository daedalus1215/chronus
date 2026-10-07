import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Logo } from '../../components/Logo/Logo';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8">
      <div className="flex w-full flex-col items-center gap-8 md:flex-row">
        {/* Logo Section */}
        <div className="flex flex-none items-center justify-center md:flex-1">
          <Logo height={300} />
        </div>

        {/* Action Section */}
        <div className="flex max-w-full flex-1 flex-col gap-6 md:max-w-[500px]">
          <div>
            <h1 className="mb-2 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
              Chronus
            </h1>
            <p className="text-lg font-normal leading-relaxed text-muted-foreground sm:text-xl">
              Your personal time tracking and note-taking companion. Organize
              your thoughts, track your time, and stay productive.
            </p>
          </div>

          <div className="mt-2 space-y-4">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="w-full rounded-full py-6 text-base font-semibold"
            >
              Create account
            </Button>

            <div className="flex items-center gap-3 py-1">
              <Separator className="flex-1" />
              <span className="text-sm text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <div className="text-center">
              <p className="mb-2 text-sm text-muted-foreground">
                Already have an account?
              </p>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full rounded-full border-2 py-6 text-base font-semibold hover:border-2"
              >
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
