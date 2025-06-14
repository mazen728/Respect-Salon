
import { redirect } from 'next/navigation';

/**
 * This is the root page.
 * It redirects to the default locale ('en') as defined in next.config.js.
 * This file exists to handle the "/" path directly if needed,
 * especially if it wasn't properly removed after internationalization setup.
 */
export default function RootPage() {
  redirect('/en');
}
