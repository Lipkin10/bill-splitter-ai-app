import ReceiptScanner from '../components/ReceiptScanner';
import Head from 'next/head';

export default function ReceiptScannerPage() {
  return (
    <>
      <Head>
        <title>Scanner de Nota Fiscal - RachaAI</title>
        <meta
          name="description"
          content="Escaneie sua nota fiscal e divida automaticamente entre os participantes com o RachaAI"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#1e1b4b" />
      </Head>
      <ReceiptScanner />
    </>
  );
}
