declare module '@vercel/analytics/next' {
    export interface AnalyticsProps {
        beforeSend?: (event: any) => any;
        debug?: boolean;
        mode?: 'auto' | 'development' | 'production';
        scriptSrc?: string;
        endpoint?: string;
        dsn?: string;
    }
    export function Analytics(props: AnalyticsProps): JSX.Element | null;
}

declare module '@vercel/analytics/react' {
    export interface AnalyticsProps {
        beforeSend?: (event: any) => any;
        debug?: boolean;
        mode?: 'auto' | 'development' | 'production';
        scriptSrc?: string;
        endpoint?: string;
        dsn?: string;
    }
    export function Analytics(props: AnalyticsProps): JSX.Element | null;
}
