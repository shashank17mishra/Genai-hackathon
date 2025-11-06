
// FIX: Correctly import React hooks to resolve 'Cannot find name' errors.
import React, { useState, useCallback, useEffect, useRef } from 'react';
import StartPage from './components/StartPage';
import Questionnaire from './components/Questionnaire';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import NavBar from './components/NavBar';
import MobileNav from './components/MobileNav';
import type { UserData, Skill, Project, CognitiveProfile } from './types';
import { supabase, getUserData, updateUserData, supabaseUrl } from './services/supabaseService';
import type { Session } from '@supabase/supabase-js';

// Import dashboard components for routing
import CognitiveMirror from './components/CognitiveMirror';
import SkillQuests from './components/SkillQuests';
import ProjectPlayground from './components/ProjectPlayground';
import Portfolio from './components/Portfolio';
import AvatarCustomizer from './components/AvatarCustomizer';


// --- NEW FUTURISTIC ICONS ---
const IconDashboard = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="currentColor" viewBox="0 0 16 16">
        <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
    </svg>
);
const IconMirror = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 3a5 5 0 1 0 0 10A5 5 0 0 0 8 3zM8 2a6 6 0 1 1 0 12A6 6 0 0 1 8 2z"/>
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm4 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5z"/>
    </svg>
);
const IconQuests = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="currentColor" viewBox="0 0 16 16">
        <path d="M7.765 1.559a.5.5 0 0 1 .47 0l6 3a.5.5 0 0 1 0 .882l-6 3a.5.5 0 0 1-.47 0l-6-3a.5.5 0 0 1 0-.882l6-3z"/>
        <path d="M2.11 8.092a.5.5 0 0 1 .235.067l6 3a.5.5 0 0 1 0 .882l-6 3a.5.5 0 0 1-.47-.235l-1-2a.5.5 0 0 1 .235-.65l5.5-2.75l-5.5-2.75a.5.5 0 0 1-.235-.65l1-2a.5.5 0 0 1 .235-.067z"/>
    </svg>
);
const IconPlayground = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 0L2 4v8l6 4 6-4V4L8 0zm0 1.229L13.195 4 8 6.771 2.805 4 8 1.229zM3 4.907L8 7.639l5-2.732V11.09l-5 2.732-5-2.732V4.907z"/>
    </svg>
);
const IconPortfolio = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="currentColor" viewBox="0 0 16 16">
        <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm4 10V4h8v8H4z"/>
    </svg>
);

const getErrorMessage = (e: any): string => {
    if (typeof e === 'string') return e;
    if (e && typeof e.message === 'string') return e.message;
    if (e && typeof e.details === 'string' && typeof e.hint === 'string') {
        return `${e.message}: ${e.details} (${e.hint})`;
    }
    return 'An unknown error occurred. Please check the developer console for more details.';
}

const withTimeout = <T,>(promise: Promise<T>, ms: number, timeoutMessage = 'Operation timed out'): Promise<T> => {
    const timeoutPromise = new Promise<T>((_, reject) => {
        setTimeout(() => {
            reject(new Error(timeoutMessage));
        }, ms);
    });
    return Promise.race([promise, timeoutPromise]);
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [criticalError, setCriticalError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const navItems = [
    { id: 'dashboard', icon: <IconDashboard />, label: 'Dashboard' },
    { id: 'cognitive-core', icon: <IconMirror />, label: 'Cognitive Core' },
    { id: 'skill-quests', icon: <IconQuests />, label: 'Quest Map' },
    { id: 'project-playground', icon: <IconPlayground />, label: 'Playground' },
    { id: 'portfolio', icon: <IconPortfolio />, label: 'Portfolio' },
  ];

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (!session) {
          setUserData(null);
          setLoading(false);
          setActiveView('dashboard'); // Reset view on sign out
          return;
        }

        const isInitialLoadOrSignIn = event === 'INITIAL_SESSION' || event === 'SIGNED_IN';

        if (isInitialLoadOrSignIn) {
          try {
            setCriticalError(null);
            const data = await withTimeout(
                getUserData(session.user),
                15000,
                'Fetching user profile timed out.'
            );
            
            if (data) {
                // Sanitize skills to ensure dependencies is always an array
                data.skills = (data.skills || []).map(skill => ({
                    ...skill,
                    dependencies: skill.dependencies || []
                }));
                
                // Sanitize projects to ensure nested properties exist
                data.projects = (data.projects || []).map(project => ({
                    ...project,
                    blueprint: project.blueprint || { requiredSkills: [], skillGaps: [], skillStrengths: [] },
                    roadmap: project.roadmap || [],
                }));
            }

            setUserData(data);
          } catch (error: any) {
             setCriticalError(getErrorMessage(error));
          }
        }
        
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleQuestionnaireComplete = useCallback(async (profile: CognitiveProfile, avatar: string, initialSkills: Skill[]) => {
    if (!session?.user) throw new Error("User session not found. Please sign in again.");
    
    const newUserData: UserData = {
      profile,
      avatarUrl: avatar,
      skills: (initialSkills || []).map(skill => ({ ...skill, dependencies: skill.dependencies || [] })),
      projects: [],
    };
    await updateUserData(session.user, newUserData);
    setUserData(newUserData);
  }, [session]);
  
  const handleSignOut = useCallback(async () => {
    setCriticalError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
        setCriticalError(getErrorMessage(error));
    } else {
        // The onAuthStateChange listener will also fire, but setting state here ensures
        // an instantaneous UI update, providing a better user experience.
        setSession(null);
        setUserData(null);
    }
  }, []);

  const updateAndSaveUserData = (updater: (prev: UserData) => UserData) => {
    if (!session?.user || !userData) return;
    const updatedData = updater(userData);
    setUserData(updatedData);
    updateUserData(session.user, updatedData);
  };

  const handleProjectCreated = (newProject: Project) => {
    updateAndSaveUserData(prev => ({
        ...prev,
        projects: [...prev.projects, newProject],
    }));
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    updateAndSaveUserData(prev => ({
      ...prev,
      avatarUrl: newAvatarUrl,
    }));
  };
  
    const handleUpdateSkillStatus = (skillId: string) => {
        updateAndSaveUserData(prev => {
            const skills = [...prev.skills];
            const skillIndex = skills.findIndex(s => s.id === skillId);
            if (skillIndex === -1) return prev;

            const skill = skills[skillIndex];
            
            if (skill.status === 'learning') {
                skills[skillIndex] = { ...skill, status: 'mastered' };
                
                skills.forEach((s, i) => {
                    if (s.status === 'locked' && s.dependencies.length > 0) {
                        const prereqsMastered = s.dependencies.every(depId => {
                            const prereq = skills.find(p => p.id === depId);
                            return prereq?.status === 'mastered';
                        });
                        if (prereqsMastered) {
                            skills[i] = { ...s, status: 'learning' };
                        }
                    }
                });
            }
            
            return { ...prev, skills };
        });
    };

    const handleSkillAdd = (newSkill: Skill) => {
        updateAndSaveUserData(prev => ({
            ...prev,
            skills: [...prev.skills, newSkill],
        }));
    };
    
    const handleSkillsAdd = (newSkills: Skill[]) => {
      updateAndSaveUserData(prev => {
        const existingSkillIds = new Set(prev.skills.map(s => s.id));
        const skillsToAdd = newSkills.filter(s => !existingSkillIds.has(s.id));
        return {
          ...prev,
          skills: [...prev.skills, ...skillsToAdd],
        };
      });
    };

    const handleGenerateCareerTree = (newSkills: Skill[]) => {
        updateAndSaveUserData(prev => ({
            ...prev,
            skills: newSkills,
        }));
    };


    const handleMobileNavigate = (view: string) => {
        setActiveView(view);
        setIsMobileMenuOpen(false);
    };

  const renderActiveView = () => {
    if (!userData) return null;
    
    const viewMap: Record<string, React.ReactNode> = {
        'cognitive-core': <CognitiveMirror profile={userData.profile} />,
        'skill-quests': <SkillQuests
                skills={userData.skills}
                onUpdateSkillStatus={handleUpdateSkillStatus}
                onSkillAdd={handleSkillAdd}
                profile={userData.profile}
                onGenerateCareerTree={handleGenerateCareerTree}
            />,
        'project-playground': <ProjectPlayground 
                profile={userData.profile}
                skills={userData.skills}
                projects={userData.projects}
                onProjectCreated={handleProjectCreated} 
                onAddSkills={handleSkillsAdd}
            />,
        'portfolio': <Portfolio skills={userData.skills} projects={userData.projects} />,
        'dashboard': <Dashboard 
                        profile={userData.profile} 
                        avatarUrl={userData.avatarUrl}
                        onCustomizeClick={() => setIsCustomizing(true)}
                    />
    }

    return viewMap[activeView] || viewMap['dashboard'];
  }

  const renderContent = () => {
    if (criticalError) {
      const isMissingTableError = criticalError.includes('relation "public.profiles" does not exist');
      const title = isMissingTableError ? "Database Setup Required" : "Database Access Error";
      const primaryMessage = isMissingTableError
          ? "Welcome! To store user profiles, you first need to create the 'profiles' table in your Supabase project. It's a quick, one-time setup."
          : "The application could not access your profile data. This is often due to Row-Level Security (RLS) policies not being configured correctly.";

      const sqlScript = `CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_data jsonb
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to manage their own profile"
ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO anon;
GRANT USAGE ON SCHEMA public TO anon;`;

      return (
        <div className="flex items-center justify-center min-h-screen p-4 text-white">
          <div className="neo-panel max-w-3xl w-full text-left">
            <h2 className="text-3xl mb-4" style={{ fontFamily: 'var(--font-header)', color: 'var(--secondary-color)' }}>
              {title}
            </h2>
            <p className="mb-4">{primaryMessage}</p>
            <p className="mb-4 font-bold text-sm">Error: <code className="bg-black/50 p-1">{criticalError}</code></p>
            <p className="mb-2">To fix this, please run the following script in your <strong>Supabase SQL Editor</strong> under "New query".</p>
            <pre className="text-xs bg-black/50 p-4 my-4 border-2 border-white overflow-x-auto">
              <code>{sqlScript}</code>
            </pre>
            <div className="mt-6 flex gap-4">
              <a 
                href={`https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].split('//')[1]}/sql`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="neo-button"
              >
                Open Supabase
              </a>
              <button
                onClick={() => window.location.reload()}
                className="neo-button secondary"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen text-2xl text-white" style={{ fontFamily: 'var(--font-body)' }}>
          LOADING...
        </div>
      );
    }

    if (!session) {
        return <StartPage />;
    }

    if (!userData) {
      return <Questionnaire onComplete={handleQuestionnaireComplete} />;
    }
    
    return renderActiveView();
  };
  
  const content = renderContent();
  const isDashboardView = !!(session && userData && !loading && !criticalError);

  if (isDashboardView && userData) {
    return (
      <div className="flex h-screen w-full">
        <NavBar 
            avatarUrl={userData.avatarUrl} 
            profile={userData.profile}
            onSignOut={handleSignOut}
            activeView={activeView}
            onNavigate={setActiveView} 
            navItems={navItems}
        />
        <MobileNav
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            avatarUrl={userData.avatarUrl}
            profile={userData.profile}
            onSignOut={handleSignOut}
            activeView={activeView}
            onNavigate={handleMobileNavigate}
            navItems={navItems}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            onMenuClick={() => setIsMobileMenuOpen(true)}
          />
          <main className="flex-grow overflow-y-auto p-4 md:p-8">
              {content}
             {isCustomizing && (
                <AvatarCustomizer 
                    profile={userData.profile}
                    currentAvatarUrl={userData.avatarUrl}
                    onClose={() => setIsCustomizing(false)}
                    onSave={handleAvatarUpdate}
                />
            )}
          </main>
        </div>
      </div>
    );
  }

  // Fallback for loading, login, questionnaire, and error states
  return (
    <div className="min-h-screen">
       {content}
    </div>
  );
};

export default App;
