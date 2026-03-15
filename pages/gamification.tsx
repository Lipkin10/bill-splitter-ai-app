import GamificationDashboard from '../components/GamificationDashboard';
import Head from 'next/head';

export default function GamificationPage() {
  return (
    <>
      <Head>
        <title>Gamificação - RachaAI</title>
        <meta
          name="description"
          content="Acompanhe seus pontos, badges e conquistas no RachaAI - sistema de gamificação para divisão de contas"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#1e1b4b" />
      </Head>
      <GamificationDashboard />
    </>
  );
}
