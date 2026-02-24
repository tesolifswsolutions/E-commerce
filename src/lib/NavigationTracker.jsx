import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { pagesConfig } from '@/pages.config';

export default function NavigationTracker() {
    const location = useLocation();
    const { Pages, mainPage } = pagesConfig;
    const mainPageKey = mainPage ?? Object.keys(Pages)[0];

    useEffect(() => {
        try {
            // Track page view (public, no login required)
            base44.tracking.trackPageView({
                page: location.pathname + location.search,
                appId: pagesConfig?.appId || undefined,
            });
        } catch (e) {
            console.error('Tracking error:', e);
        }
    }, [location]);

    return null;
}