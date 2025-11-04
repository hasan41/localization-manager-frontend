import { NextResponse } from 'next/server';
import { ComponentDB } from '@/app/lib/database';

// GET /api/components/[id] - Get component by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const componentDB = ComponentDB.getInstance();
    const component = await componentDB.getById(id);

    if (!component) {
      return NextResponse.json(
        { success: false, error: 'Component not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, component });
  } catch (error) {
    console.error('Error fetching component:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch component' },
      { status: 500 }
    );
  }
}

// PUT /api/components/[id] - Update component
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, code, description } = body;

    const componentDB = ComponentDB.getInstance();
    const updates: Partial<{ name: string; code: string; description: string }> = {};

    if (name !== undefined) updates.name = name;
    if (code !== undefined) updates.code = code;
    if (description !== undefined) updates.description = description;

    await componentDB.update(id, updates);

    return NextResponse.json({
      success: true,
      message: 'Component updated successfully'
    });
  } catch (error) {
    console.error('Error updating component:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update component' },
      { status: 500 }
    );
  }
}

// DELETE /api/components/[id] - Delete component
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const componentDB = ComponentDB.getInstance();
    await componentDB.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Component deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting component:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete component' },
      { status: 500 }
    );
  }
}
