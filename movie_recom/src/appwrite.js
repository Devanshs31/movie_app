import { Client, Databases, ID, Query } from 'appwrite';

// Environment variables for AppWrite project configuration
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

// Initialize the AppWrite client
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Set the AppWrite API endpoint
    .setProject(PROJECT_ID); // Set the AppWrite project ID

// Initialize the AppWrite database instance
const database = new Databases(client);

// Function to update the search count for a movie
export const updateSearchCount = async (searchTerm, movie) => {
    // Use AppWrite SDK to check if a document with the same search term exists in the database
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm)
        ]);

        // If the document exists, increment the count by 1
        if (result.documents.length > 0) {
            const doc = result.documents[0];

            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1
            });
        }
        // If the document doesn't exist, create a new document with count 1
        else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            });
        }
    } catch (error) {
        // Log any errors that occur during the process
        console.error(`Error checking document: ${error}`);
    }
};

// Function to get the top 5 trending movies based on search count
export const getTrendingMovies = async () => {
    try {
        // Query the database to get the top 5 documents ordered by descending count
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc("count")
        ]);

        // Return the list of trending movies
        return result.documents;
    } catch (error) {
        // Log any errors that occur during the process
        console.error(error);
    }
};