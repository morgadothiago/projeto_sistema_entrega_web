import { ERole, User } from '@/app/types/User';
import { auth } from '@/app/util/auth';
import { redirect } from 'next/navigation';
import React from 'react';

interface IProps {
  children: React.ReactNode;
}

const Layout: React.FC<IProps> = async ({ children }: IProps) => {
  const Session = await auth()

  
    if ((Session?.user as unknown as User)?.role !== ERole.ADMIN) {
      redirect('/dashboard')
    }

  return <>{children}</>;
}

export default Layout;