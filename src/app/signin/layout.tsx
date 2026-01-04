import React from 'react';
import { redirect, RedirectType } from 'next/navigation';
import { auth } from '../util/auth';

// import { Container } from './styles';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = async ({ children }) => {
  try {
    const session = await auth()

    if(session){
      redirect('/dashboard', RedirectType.push)
    }
  } catch (error) {
    // If auth fails, just show the signin page
  }

  return <>{children}</>;
}

export default Layout;