import { NextRequest, NextResponse } from "next/server";
import { QdrantClient } from "@qdrant/js-client-rest";

// Initialize Qdrant client
const getQdrantClient = () => {
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;

  if (!url || !apiKey) {
    throw new Error("QDRANT_URL and QDRANT_API_KEY must be configured");
  }

  return new QdrantClient({
    url,
    apiKey,
  });
};

// GET: List collections
export async function GET() {
  try {
    const qdrant = getQdrantClient();
    const collections = await qdrant.getCollections();

    return NextResponse.json({
      success: true,
      data: {
        collections: collections.collections,
      },
    });
  } catch (error) {
    console.error("List collections error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to list collections",
      },
      { status: 500 }
    );
  }
}

// POST: Store vectors in a collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collectionName, points, vectorSize = 1024 } = body;

    if (!collectionName) {
      return NextResponse.json(
        { success: false, error: "Collection name is required" },
        { status: 400 }
      );
    }

    if (!points || !Array.isArray(points) || points.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Points array is required and must not be empty",
        },
        { status: 400 }
      );
    }

    const qdrant = getQdrantClient();

    // Check if collection exists, create if not
    const collections = await qdrant.getCollections();
    const collectionExists = collections.collections.some(
      (c) => c.name === collectionName
    );

    if (!collectionExists) {
      // Create collection
      await qdrant.createCollection(collectionName, {
        vectors: {
          size: vectorSize,
          distance: "Cosine",
        },
      });
    }

    // Upsert points
    const result = await qdrant.upsert(collectionName, {
      wait: true,
      points,
    });

    return NextResponse.json({
      success: true,
      data: {
        collectionName,
        operation: result.operation_id,
        status: result.status,
        pointsCount: points.length,
      },
    });
  } catch (error) {
    console.error("Store vectors error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to store vectors",
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove vectors by ID
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { collectionName, pointIds } = body;

    if (!collectionName) {
      return NextResponse.json(
        { success: false, error: "Collection name is required" },
        { status: 400 }
      );
    }

    if (!pointIds || !Array.isArray(pointIds) || pointIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Point IDs array is required and must not be empty",
        },
        { status: 400 }
      );
    }

    const qdrant = getQdrantClient();

    // Delete points
    const result = await qdrant.delete(collectionName, {
      wait: true,
      points: pointIds,
    });

    return NextResponse.json({
      success: true,
      data: {
        collectionName,
        operation: result.operation_id,
        status: result.status,
        deletedCount: pointIds.length,
      },
    });
  } catch (error) {
    console.error("Delete vectors error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete vectors",
      },
      { status: 500 }
    );
  }
}

