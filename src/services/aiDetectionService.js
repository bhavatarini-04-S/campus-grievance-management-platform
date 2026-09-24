/**
 * AI Detection Service for CampusFix
 * Handles duplicate detection, similarity scoring, clustering, and impact analysis
 */

// Configuration for duplicate detection thresholds and weights
const CONFIG = {
  DUPLICATE_THRESHOLD: 0.85,
  POSSIBLE_DUPLICATE_THRESHOLD: 0.70,
  SIMILARITY_WEIGHTS: {
    TEXT: 0.60,
    LOCATION: 0.25,
    TIME: 0.15
  },
  TIME_WINDOW_HOURS: 24, // Time window for time proximity scoring
  IMPACT_WEIGHTS: {
    SUPPORT_COUNT: 0.40,
    DUPLICATE_COUNT: 0.30,
    PRIORITY: 0.20,
    CATEGORY_SEVERITY: 0.10
  }
};

// Category severity mapping for impact calculation
const CATEGORY_SEVERITY = {
  'IT Services': 0.8,
  'Electrical': 0.9,
  'Plumbing': 0.7,
  'Security': 1.0,
  'Food Services': 0.6,
  'Academic': 0.5,
  'Infrastructure': 0.7,
  'Other': 0.4
};

// Priority values for impact calculation
const PRIORITY_VALUES = {
  'LOW': 0.25,
  'MEDIUM': 0.5,
  'HIGH': 0.75,
  'CRITICAL': 1.0
};

/**
 * TF-IDF + Cosine Similarity Implementation
 * Practical MVP approach for text similarity without heavy ML infrastructure
 */
class TextSimilarity {
  constructor() {
    this.documents = [];
    this.vocabulary = new Set();
    this.idfCache = new Map();
  }

  /**
   * Tokenize and normalize text
   */
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  /**
   * Add document to the corpus
   */
  addDocument(id, text) {
    const tokens = this.tokenize(text);
    this.documents.push({ id, tokens });
    tokens.forEach(token => this.vocabulary.add(token));
  }

  /**
   * Calculate term frequency
   */
  calculateTF(tokens) {
    const tf = {};
    const total = tokens.length;
    tokens.forEach(token => {
      tf[token] = (tf[token] || 0) + 1;
    });
    Object.keys(tf).forEach(token => {
      tf[token] = tf[token] / total;
    });
    return tf;
  }

  /**
   * Calculate inverse document frequency
   */
  calculateIDF(term) {
    if (this.idfCache.has(term)) {
      return this.idfCache.get(term);
    }
    
    const docCount = this.documents.filter(doc => 
      doc.tokens.includes(term)
    ).length;
    
    const idf = docCount > 0 ? Math.log(this.documents.length / (1 + docCount)) : 0;
    this.idfCache.set(term, idf);
    return idf;
  }

  /**
   * Calculate TF-IDF vector for a document
   */
  calculateTFIDF(tokens) {
    const tf = this.calculateTF(tokens);
    const vector = {};
    
    this.vocabulary.forEach(term => {
      vector[term] = tf[term] * this.calculateIDF(term);
    });
    
    return vector;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vec1, vec2) {
    const terms = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    terms.forEach(term => {
      const v1 = vec1[term] || 0;
      const v2 = vec2[term] || 0;
      dotProduct += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    });
    
    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Calculate similarity between two text strings
   */
  calculateSimilarity(text1, text2) {
    const tokens1 = this.tokenize(text1);
    const tokens2 = this.tokenize(text2);
    
    const vec1 = this.calculateTFIDF(tokens1);
    const vec2 = this.calculateTFIDF(tokens2);
    
    return this.cosineSimilarity(vec1, vec2);
  }

  /**
   * Reset the corpus
   */
  reset() {
    this.documents = [];
    this.vocabulary = new Set();
    this.idfCache = new Map();
  }
}

/**
 * Location similarity calculation
 */
class LocationSimilarity {
  /**
   * Normalize location string
   */
  normalizeLocation(location) {
    if (!location) return '';
    return location
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculate location similarity using Jaccard similarity
   */
  calculateSimilarity(loc1, loc2) {
    const norm1 = this.normalizeLocation(loc1);
    const norm2 = this.normalizeLocation(loc2);
    
    if (norm1 === norm2) return 1.0;
    
    const tokens1 = new Set(norm1.split(' '));
    const tokens2 = new Set(norm2.split(' '));
    
    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
    const union = new Set([...tokens1, ...tokens2]);
    
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  }

  /**
   * Check if locations are similar (partial match)
   */
  isSimilarLocation(loc1, loc2, threshold = 0.5) {
    return this.calculateSimilarity(loc1, loc2) >= threshold;
  }
}

/**
 * Time proximity calculation
 */
class TimeProximity {
  /**
   * Calculate time similarity score based on proximity
   */
  calculateSimilarity(timestamp1, timestamp2) {
    const time1 = new Date(timestamp1).getTime();
    const time2 = new Date(timestamp2).getTime();
    
    const diffHours = Math.abs(time1 - time2) / (1000 * 60 * 60);
    
    // If within the time window, calculate decay
    if (diffHours <= CONFIG.TIME_WINDOW_HOURS) {
      return 1 - (diffHours / CONFIG.TIME_WINDOW_HOURS);
    }
    
    // Beyond time window, exponentially decay
    return Math.exp(-diffHours / CONFIG.TIME_WINDOW_HOURS);
  }
}

/**
 * Main AI Detection Service
 */
class AIDetectionService {
  constructor() {
    this.textSimilarity = new TextSimilarity();
    this.locationSimilarity = new LocationSimilarity();
    this.timeProximity = new TimeProximity();
    this.complaints = new Map(); // In-memory storage
    this.clusters = new Map(); // Cluster management
    this.upvotes = new Map(); // Track upvotes: complaintId -> Set of userIds
  }

  /**
   * Initialize the service with existing complaints
   */
  initialize(complaintsData) {
    this.textSimilarity.reset();
    this.complaints.clear();
    
    complaintsData.forEach(complaint => {
      this.complaints.set(complaint.id, complaint);
      this.textSimilarity.addDocument(complaint.id, `${complaint.title} ${complaint.description || ''}`);
    });
  }

  /**
   * Check for duplicates of a new complaint
   */
  checkDuplicate(newComplaint) {
    const matches = [];
    const searchText = `${newComplaint.title} ${newComplaint.description || ''}`;
    
    this.complaints.forEach((existingComplaint) => {
      // Skip if it's the same complaint
      if (existingComplaint.id === newComplaint.id) return;
      
      // Calculate individual similarity scores
      const textScore = this.textSimilarity.calculateSimilarity(
        searchText,
        `${existingComplaint.title} ${existingComplaint.description || ''}`
      );
      
      const locationScore = this.locationSimilarity.calculateSimilarity(
        newComplaint.location,
        existingComplaint.location
      );
      
      const timeScore = this.timeProximity.calculateSimilarity(
        newComplaint.createdAt || new Date().toISOString(),
        existingComplaint.createdAt || new Date().toISOString()
      );
      
      // Calculate weighted overall score
      const overallScore = 
        textScore * CONFIG.SIMILARITY_WEIGHTS.TEXT +
        locationScore * CONFIG.SIMILARITY_WEIGHTS.LOCATION +
        timeScore * CONFIG.SIMILARITY_WEIGHTS.TIME;
      
      // Category match bonus
      const categoryMatch = newComplaint.category === existingComplaint.category;
      const finalScore = categoryMatch ? Math.min(overallScore + 0.05, 1.0) : overallScore;
      
      if (finalScore >= CONFIG.POSSIBLE_DUPLICATE_THRESHOLD) {
        matches.push({
          complaint_id: existingComplaint.id,
          similarity_score: Math.round(textScore * 100) / 100,
          location_score: Math.round(locationScore * 100) / 100,
          time_score: Math.round(timeScore * 100) / 100,
          overall_score: Math.round(finalScore * 100) / 100,
          category_match: categoryMatch,
          explanation: this.generateExplanation(textScore, locationScore, timeScore, categoryMatch)
        });
      }
    });
    
    // Sort by overall score descending
    matches.sort((a, b) => b.overall_score - a.overall_score);
    
    const isDuplicate = matches.length > 0 && matches[0].overall_score >= CONFIG.DUPLICATE_THRESHOLD;
    
    return {
      is_duplicate: isDuplicate,
      matches: matches.slice(0, 5), // Return top 5 matches
      threshold: CONFIG.DUPLICATE_THRESHOLD
    };
  }

  /**
   * Generate human-readable explanation for duplicate detection
   */
  generateExplanation(textScore, locationScore, timeScore, categoryMatch) {
    const reasons = [];
    
    if (textScore >= 0.8) {
      reasons.push('very similar text content');
    } else if (textScore >= 0.6) {
      reasons.push('similar text content');
    }
    
    if (locationScore >= 0.8) {
      reasons.push('same location');
    } else if (locationScore >= 0.5) {
      reasons.push('nearby location');
    }
    
    if (timeScore >= 0.7) {
      reasons.push('reported recently');
    }
    
    if (categoryMatch) {
      reasons.push('same category');
    }
    
    if (reasons.length === 0) {
      return 'Some similarity detected';
    }
    
    return `High similarity because ${reasons.join(', ')}.`;
  }

  /**
   * Create or update a complaint cluster
   */
  createCluster(complaintId, relatedComplaintIds = []) {
    const clusterId = `CLUSTER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Mark primary complaint
    const primaryComplaint = this.complaints.get(complaintId);
    if (primaryComplaint) {
      primaryComplaint.cluster_id = clusterId;
      primaryComplaint.is_primary = true;
    }
    
    // Add related complaints to cluster
    relatedComplaintIds.forEach(relatedId => {
      const relatedComplaint = this.complaints.get(relatedId);
      if (relatedComplaint) {
        relatedComplaint.cluster_id = clusterId;
        relatedComplaint.is_primary = false;
        relatedComplaint.duplicate_of = complaintId;
      }
    });
    
    this.clusters.set(clusterId, {
      id: clusterId,
      primary_complaint_id: complaintId,
      complaint_ids: [complaintId, ...relatedComplaintIds],
      created_at: new Date().toISOString()
    });
    
    return clusterId;
  }

  /**
   * Get cluster information
   */
  getCluster(clusterId) {
    return this.clusters.get(clusterId);
  }

  /**
   * Get all complaints in a cluster
   */
  getClusterComplaints(clusterId) {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) return [];
    
    return cluster.complaint_ids.map(id => this.complaints.get(id)).filter(Boolean);
  }

  /**
   * Get duplicates of a complaint
   */
  getDuplicates(complaintId) {
    const complaint = this.complaints.get(complaintId);
    if (!complaint) return [];
    
    const duplicates = [];
    
    this.complaints.forEach((otherComplaint) => {
      if (otherComplaint.duplicate_of === complaintId) {
        duplicates.push(otherComplaint);
      }
    });
    
    return duplicates;
  }

  /**
   * Add upvote to a complaint
   */
  addUpvote(complaintId, userId) {
    if (!this.upvotes.has(complaintId)) {
      this.upvotes.set(complaintId, new Set());
    }
    
    const complaintUpvotes = this.upvotes.get(complaintId);
    
    // Check if user already upvoted
    if (complaintUpvotes.has(userId)) {
      return { success: false, message: 'User already upvoted this complaint' };
    }
    
    complaintUpvotes.add(userId);
    
    // Update complaint support count
    const complaint = this.complaints.get(complaintId);
    if (complaint) {
      complaint.support_count = (complaint.support_count || 0) + 1;
    }
    
    return { success: true, support_count: complaint?.support_count || 1 };
  }

  /**
   * Remove upvote from a complaint
   */
  removeUpvote(complaintId, userId) {
    const complaintUpvotes = this.upvotes.get(complaintId);
    
    if (!complaintUpvotes || !complaintUpvotes.has(userId)) {
      return { success: false, message: 'User has not upvoted this complaint' };
    }
    
    complaintUpvotes.delete(userId);
    
    // Update complaint support count
    const complaint = this.complaints.get(complaintId);
    if (complaint) {
      complaint.support_count = Math.max((complaint.support_count || 1) - 1, 0);
    }
    
    return { success: true, support_count: complaint?.support_count || 0 };
  }

  /**
   * Get upvote count for a complaint
   */
  getUpvoteCount(complaintId) {
    return this.upvotes.get(complaintId)?.size || 0;
  }

  /**
   * Calculate impact score for a complaint
   */
  calculateImpactScore(complaint) {
    const supportCount = complaint.support_count || 0;
    const duplicateCount = this.getDuplicates(complaint.id).length;
    const priorityValue = PRIORITY_VALUES[complaint.priority] || 0.5;
    const categorySeverity = CATEGORY_SEVERITY[complaint.category] || 0.5;
    
    // Calculate weighted impact score
    const impactScore = 
      (Math.min(supportCount / 10, 1) * CONFIG.IMPACT_WEIGHTS.SUPPORT_COUNT) +
      (Math.min(duplicateCount / 5, 1) * CONFIG.IMPACT_WEIGHTS.DUPLICATE_COUNT) +
      (priorityValue * CONFIG.IMPACT_WEIGHTS.PRIORITY) +
      (categorySeverity * CONFIG.IMPACT_WEIGHTS.CATEGORY_SEVERITY);
    
    return Math.round(impactScore * 100) / 100;
  }

  /**
   * Get impact level and explanation
   */
  getImpactInfo(complaint) {
    const impactScore = this.calculateImpactScore(complaint);
    const duplicateCount = this.getDuplicates(complaint.id).length;
    const totalReports = (complaint.support_count || 0) + duplicateCount + 1;
    
    let level;
    if (impactScore >= 0.8) level = 'Critical';
    else if (impactScore >= 0.6) level = 'High';
    else if (impactScore >= 0.4) level = 'Medium';
    else level = 'Low';
    
    let explanation;
    if (totalReports > 10) {
      explanation = `${totalReports} students reported or supported this issue.`;
    } else if (totalReports > 5) {
      explanation = `${totalReports} students reported or supported this issue.`;
    } else if (duplicateCount > 0) {
      explanation = `${duplicateCount} similar complaint(s) found.`;
    } else {
      explanation = 'Single report with no supporters yet.';
    }
    
    return {
      score: impactScore,
      level,
      explanation
    };
  }

  /**
   * Get trending complaints
   */
  getTrendingComplaints(options = {}) {
    const {
      limit = 10,
      timeWindowHours = 72,
      excludeSensitive = true
    } = options;
    
    const trending = [];
    const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    
    this.complaints.forEach((complaint) => {
      // Filter by time window
      const complaintTime = new Date(complaint.createdAt || complaint.created_at);
      if (complaintTime < cutoffTime) return;
      
      // Exclude sensitive complaints if requested
      if (excludeSensitive && complaint.isSensitive) return;
      
      // Calculate trending score
      const impactScore = this.calculateImpactScore(complaint);
      const upvoteCount = this.getUpvoteCount(complaint.id);
      const duplicateCount = this.getDuplicates(complaint.id).length;
      
      // Recent activity bonus
      const hoursSinceCreation = (Date.now() - complaintTime.getTime()) / (1000 * 60 * 60);
      const recencyBonus = Math.max(0, 1 - (hoursSinceCreation / timeWindowHours));
      
      const trendingScore = impactScore * 0.5 + 
                           (upvoteCount / 10) * 0.3 + 
                           (duplicateCount / 5) * 0.2 +
                           recencyBonus * 0.2;
      
      trending.push({
        ...complaint,
        trending_score: Math.round(trendingScore * 100) / 100,
        impact_score: impactScore,
        upvote_count: upvoteCount,
        duplicate_count: duplicateCount
      });
    });
    
    // Sort by trending score
    trending.sort((a, b) => b.trending_score - a.trending_score);
    
    return trending.slice(0, limit);
  }

  /**
   * Add a new complaint to the system
   */
  addComplaint(complaint) {
    const newComplaint = {
      ...complaint,
      id: complaint.id || `CMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: complaint.createdAt || new Date().toISOString(),
      support_count: complaint.support_count || 0,
      cluster_id: complaint.cluster_id || null,
      is_primary: complaint.is_primary !== false,
      duplicate_of: complaint.duplicate_of || null
    };
    
    this.complaints.set(newComplaint.id, newComplaint);
    this.textSimilarity.addDocument(newComplaint.id, `${newComplaint.title} ${newComplaint.description || ''}`);
    
    return newComplaint;
  }

  /**
   * Get a complaint by ID
   */
  getComplaint(complaintId) {
    return this.complaints.get(complaintId);
  }

  /**
   * Get all complaints
   */
  getAllComplaints() {
    return Array.from(this.complaints.values());
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    Object.assign(CONFIG, newConfig);
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...CONFIG };
  }
}

// Export singleton instance
const aiDetectionService = new AIDetectionService();

export default aiDetectionService;
export { CONFIG, TextSimilarity, LocationSimilarity, TimeProximity, AIDetectionService };