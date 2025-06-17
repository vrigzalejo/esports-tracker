import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { performSecurityCheck, createSecurityErrorResponse } from '@/lib/apiSecurity';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ tournamentId: string }> }
) {
    try {
        // Perform security checks
        const securityCheck = performSecurityCheck(request);
        if (!securityCheck.allowed) {
            return createSecurityErrorResponse(
                securityCheck.error || 'Access denied',
                403
            );
        }

        const { tournamentId } = await params;
        
        if (!tournamentId) {
            return NextResponse.json(
                { error: 'Tournament ID is required' },
                { status: 400 }
            );
        }

        // Return empty array - brackets functionality is disabled
        return NextResponse.json([]);
    } catch {
        return NextResponse.json(
            { error: 'Failed to fetch tournament brackets' },
            { status: 500 }
        );
    }
} 