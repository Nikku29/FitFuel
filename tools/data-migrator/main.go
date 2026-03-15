package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

func main() {
	log.Println("FitFuel High-Performance Data Migrator (Go)")

	projectID := flag.String("project", "", "Firebase Project ID")
	sourceCollection := flag.String("source", "", "Source collection path")
	destCollection := flag.String("dest", "", "Destination collection path")
	flag.Parse()

	if *projectID == "" || *sourceCollection == "" || *destCollection == "" {
		log.Fatal("Usage: data-migrator -project <projectId> -source <collection> -dest <collection>")
	}

	ctx := context.Background()
	
	// Note: Expects GOOGLE_APPLICATION_CREDENTIALS environment variable
	client, err := firestore.NewClient(ctx, *projectID)
	if err != nil {
		log.Fatalf("Failed to create Firestore client: %v", err)
	}
	defer client.Close()

	start := time.Now()
	log.Printf("Starting migration from %s to %s...", *sourceCollection, *destCollection)

	iter := client.Collection(*sourceCollection).Documents(ctx)
	count := 0

	// Use Batched Writes for high performance
	batch := client.Batch()
	batchCount := 0

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Fatalf("Failed to iterate documents: %v", err)
		}

		// Read data and write to destination
		newDocRef := client.Collection(*destCollection).Doc(doc.Ref.ID)
		batch.Set(newDocRef, doc.Data())
		
		count++
		batchCount++

		// Firestore batch limit is 500
		if batchCount == 450 {
			_, err := batch.Commit(ctx)
			if err != nil {
				log.Fatalf("Failed to commit batch: %v", err)
			}
			log.Printf("Committed 450 documents...")
			
			// Reset batch
			batch = client.Batch()
			batchCount = 0
		}
	}

	// Commit any remaining
	if batchCount > 0 {
		_, err := batch.Commit(ctx)
		if err != nil {
			log.Fatalf("Failed to commit final batch: %v", err)
		}
	}

	duration := time.Since(start)
	fmt.Printf("✅ Migration completed successfully in %v.\n", duration)
	fmt.Printf("📊 Total documents migrated: %d\n", count)
	os.Exit(0)
}
