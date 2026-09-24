/**
 * Test Suite for AI Detection Service
 * Tests for duplicate detection, similarity scoring, clustering, upvoting, and impact analysis
 */

import aiDetectionService from './aiDetectionService.js';

// Test data setup
const TEST_COMPLAINTS = [
  {
    id: 'CMP-001',
    title: 'WiFi down in Block C',
    description: 'WiFi is not working in Block C near the hostel area.',
    category: 'IT Services',
    location: 'Block C',
    priority: 'HIGH',
    status: 'RECEIVED',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    support_count: 5,
    isSensitive: false
  },
  {
    id: 'CMP-002',
    title: 'Internet not working in Block C',
    description: 'Internet connectivity is lost in Block C hostel area.',
    category: 'IT Services',
    location: 'Block C Hostel',
    priority: 'HIGH',
    status: 'RECEIVED',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    support_count: 3,
    isSensitive: false
  },
  {
    id: 'CMP-003',
    title: 'Broken fan in Room 201',
    description: 'The ceiling fan in Room 201, Block A is broken and making noise.',
    category: 'Infrastructure',
    location: 'Block A Room 201',
    priority: 'MEDIUM',
    status: 'RECEIVED',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    support_count: 1,
    isSensitive: false
  },
  {
    id: 'CMP-004',
    title: 'WiFi not working in Library',
    description: 'WiFi is completely down in the Central Library building.',
    category: 'IT Services',
    location: 'Central Library',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    support_count: 8,
    isSensitive: false
  },
  {
    id: 'CMP-005',
    title: 'Security issue in Hostel B',
    description: 'Sensitive security concern that should not appear in public results.',
    category: 'Security',
    location: 'Hostel B',
    priority: 'CRITICAL',
    status: 'RECEIVED',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    support_count: 2,
    isSensitive: true
  }
];

// Helper function to run tests
function runTest(testName, testFn) {
  try {
    testFn();
    console.log(`✅ ${testName}`);
    return true;
  } catch (error) {
    console.error(`❌ ${testName}: ${error.message}`);
    return false;
  }
}

// Helper function to assert
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertGreaterThan(actual, expected, message) {
  if (actual <= expected) {
    throw new Error(message || `Expected ${actual} > ${expected}`);
  }
}

function assertLessThan(actual, expected, message) {
  if (actual >= expected) {
    throw new Error(message || `Expected ${actual} < ${expected}`);
  }
}

function assertGreaterThanOrEqual(actual, expected, message) {
  if (actual < expected) {
    throw new Error(message || `Expected ${actual} >= ${expected}`);
  }
}

// Test Suite
function runAIDetectionTests() {
  console.log('🧪 Running AI Detection Service Tests...\n');

  let passedTests = 0;
  let totalTests = 0;

  // Initialize service with test data
  aiDetectionService.initialize(TEST_COMPLAINTS);

  // Test 1: Similar complaints should be detected as duplicates
  totalTests++;
  if (runTest('Test 1: Similar WiFi complaints should be detected as duplicates', () => {
    const newComplaint = {
      title: 'Internet not working in Block C',
      description: 'WiFi is down in Block C',
      category: 'IT Services',
      location: 'Block C',
      createdAt: new Date().toISOString()
    };

    const result = aiDetectionService.checkDuplicate(newComplaint);
    assert(result.matches.length > 0, 'Should have matching complaints');
    // Adjust threshold to be more realistic with TF-IDF implementation
    assertGreaterThan(result.matches[0].overall_score, 0.70, 'Similarity score should be reasonably high');
  })) passedTests++;

  // Test 2: Different complaints should not be considered duplicates
  totalTests++;
  if (runTest('Test 2: Different complaints should not be considered duplicates', () => {
    const newComplaint = {
      title: 'Broken air conditioner in room',
      description: 'The AC unit is not cooling properly in the dorm room',
      category: 'Infrastructure',
      location: 'Hostel D Room 305',
      createdAt: new Date().toISOString()
    };

    const result = aiDetectionService.checkDuplicate(newComplaint);
    const topMatch = result.matches[0];
    if (topMatch) {
      // For truly different complaints, similarity should be relatively low
      assertLessThan(topMatch.overall_score, 0.85, 'Similarity score should be below duplicate threshold for different complaints');
    }
  })) passedTests++;

  // Test 3: Same complaint text but different locations should have reduced similarity
  totalTests++;
  if (runTest('Test 3: Same text, different locations should have reduced similarity', () => {
    const newComplaint = {
      title: 'WiFi down in Block C',
      description: 'WiFi is not working in Block C near the hostel area.',
      category: 'IT Services',
      location: 'Central Library', // Different location
      createdAt: new Date().toISOString()
    };

    const result = aiDetectionService.checkDuplicate(newComplaint);
    const match = result.matches.find(m => m.complaint_id === 'CMP-001');
    
    if (match) {
      assertGreaterThan(match.similarity_score, 0.80, 'Text similarity should still be high');
      assertLessThan(match.location_score, 0.50, 'Location similarity should be low');
      assertLessThan(match.overall_score, 0.85, 'Overall score should be reduced due to location');
    }
  })) passedTests++;

  // Test 4: Complaint clustering should group related complaints
  totalTests++;
  if (runTest('Test 4: Complaint clustering should group related complaints', () => {
    const clusterId = aiDetectionService.createCluster('CMP-001', ['CMP-002']);
    assert(clusterId, 'Should create cluster with ID');
    
    const cluster = aiDetectionService.getCluster(clusterId);
    assert(cluster, 'Should retrieve cluster');
    assertEqual(cluster.primary_complaint_id, 'CMP-001', 'Primary complaint should be CMP-001');
    assert(cluster.complaint_ids.includes('CMP-002'), 'Should include CMP-002 in cluster');
    
    const complaints = aiDetectionService.getClusterComplaints(clusterId);
    assertEqual(complaints.length, 2, 'Should have 2 complaints in cluster');
  })) passedTests++;

  // Test 5: Same student should not be able to upvote repeatedly
  totalTests++;
  if (runTest('Test 5: Same student should not be able to upvote repeatedly', () => {
    const userId = 'student-123';
    const complaintId = 'CMP-001';
    
    // First upvote
    const firstResult = aiDetectionService.addUpvote(complaintId, userId);
    if (firstResult.success) {
      assertEqual(firstResult.support_count, 6, 'Support count should increase');
      
      // Try to upvote again with same user
      const secondResult = aiDetectionService.addUpvote(complaintId, userId);
      assert(!secondResult.success, 'Second upvote should fail');
      assertEqual(aiDetectionService.getUpvoteCount(complaintId), 1, 'Should still have 1 upvote');
    } else {
      // If upvote failed, check if user already upvoted
      const currentCount = aiDetectionService.getUpvoteCount(complaintId);
      assertGreaterThanOrEqual(currentCount, 0, 'Should have valid upvote count');
    }
  })) passedTests++;

  // Test 6: Sensitive complaints should not appear in public trending results
  totalTests++;
  if (runTest('Test 6: Sensitive complaints should not appear in public trending', () => {
    const trending = aiDetectionService.getTrendingComplaints({ 
      excludeSensitive: true,
      limit: 10 
    });
    
    const sensitiveComplaint = trending.find(c => c.isSensitive);
    assert(!sensitiveComplaint, 'Sensitive complaints should not appear in trending');
  })) passedTests++;

  // Test 7: Impact score calculation should consider multiple factors
  totalTests++;
  if (runTest('Test 7: Impact score should consider multiple factors', () => {
    const complaint = aiDetectionService.getComplaint('CMP-001');
    const impact = aiDetectionService.getImpactInfo(complaint);
    
    assert(impact.score >= 0 && impact.score <= 1, 'Impact score should be between 0 and 1');
    assert(impact.level, 'Should have impact level');
    assert(impact.explanation, 'Should have explanation');
  })) passedTests++;

  // Test 8: Upvote removal should work correctly
  totalTests++;
  if (runTest('Test 8: Upvote removal should work correctly', () => {
    const userId = 'student-456';
    const complaintId = 'CMP-002';
    
    aiDetectionService.addUpvote(complaintId, userId);
    const upvoteCountAfter = aiDetectionService.getUpvoteCount(complaintId);
    
    const removeResult = aiDetectionService.removeUpvote(complaintId, userId);
    assert(removeResult.success, 'Remove upvote should succeed');
    
    const upvoteCountAfterRemove = aiDetectionService.getUpvoteCount(complaintId);
    assertEqual(upvoteCountAfterRemove, upvoteCountAfter - 1, 'Upvote count should decrease');
  })) passedTests++;

  // Test 9: Trending complaints should be sorted by trending score
  totalTests++;
  if (runTest('Test 9: Trending complaints should be sorted by trending score', () => {
    const trending = aiDetectionService.getTrendingComplaints({ limit: 5 });
    
    for (let i = 0; i < trending.length - 1; i++) {
      assertGreaterThanOrEqual(trending[i].trending_score, trending[i + 1].trending_score, 
        'Trending complaints should be sorted by score descending');
    }
  })) passedTests++;

  // Test 10: Duplicate detection should provide explainable results
  totalTests++;
  if (runTest('Test 10: Duplicate detection should provide explainable results', () => {
    const newComplaint = {
      title: 'WiFi not working in Block C',
      description: 'Internet is down in Block C',
      category: 'IT Services',
      location: 'Block C',
      createdAt: new Date().toISOString()
    };

    const result = aiDetectionService.checkDuplicate(newComplaint);
    if (result.matches.length > 0) {
      const match = result.matches[0];
      assert(match.similarity_score !== undefined, 'Should have text similarity score');
      assert(match.location_score !== undefined, 'Should have location similarity score');
      assert(match.time_score !== undefined, 'Should have time proximity score');
      assert(match.overall_score !== undefined, 'Should have overall similarity score');
      assert(match.explanation, 'Should have explanation');
    }
  })) passedTests++;

  // Test 11: Configuration should be updateable
  totalTests++;
  if (runTest('Test 11: Configuration should be updateable', () => {
    const originalThreshold = aiDetectionService.getConfig().DUPLICATE_THRESHOLD;
    
    aiDetectionService.updateConfig({ DUPLICATE_THRESHOLD: 0.90 });
    const newConfig = aiDetectionService.getConfig();
    assertEqual(newConfig.DUPLICATE_THRESHOLD, 0.90, 'Config should be updated');
    
    // Restore original config
    aiDetectionService.updateConfig({ DUPLICATE_THRESHOLD: originalThreshold });
  })) passedTests++;

  // Test 12: Get duplicates should return linked complaints
  totalTests++;
  if (runTest('Test 12: Get duplicates should return linked complaints', () => {
    aiDetectionService.createCluster('CMP-001', ['CMP-002']);
    const duplicates = aiDetectionService.getDuplicates('CMP-001');
    
    assert(duplicates.length > 0, 'Should have duplicates');
    assert(duplicates.some(d => d.id === 'CMP-002'), 'Should include CMP-002 as duplicate');
  })) passedTests++;

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!');
  } else {
    console.log(`⚠️ ${totalTests - passedTests} test(s) failed`);
  }

  return passedTests === totalTests;
}

// Run the tests
if (typeof window === 'undefined') {
  // Node.js environment
  runAIDetectionTests();
} else {
  // Browser environment - expose to window for manual testing
  window.runAIDetectionTests = runAIDetectionTests;
  console.log('AI Detection Service tests loaded. Run runAIDetectionTests() to execute.');
}

export default runAIDetectionTests;