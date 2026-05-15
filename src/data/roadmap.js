const DEFAULT_START = '2026-05-08';
const DEADLINE = '2026-08-31';

const rawWeeks = [
  { topics: 'Arrays & Hashing (foundation)', target: '15-18', notes: 'Basics: prefix sum, hash map, set, list comprehension.', problems: ['Contains Duplicate', 'Valid Anagram', 'Two Sum', 'Group Anagrams', 'Top K Frequent Elements', 'Product of Array Except Self', 'Valid Sudoku', 'Longest Consecutive Sequence', 'Majority Element', 'Ransom Note', 'Merge Sorted Array', 'Set Matrix Zeroes', "Pascal's Triangle", 'Maximum Subarray', 'Sort Colors'] },
  { topics: 'Arrays & Hashing (medium patterns)', target: '12-15', notes: 'Two-sum variants, subarray sum, product except self.', problems: ['Subarray Sum Equals K', 'Encode and Decode Strings', 'Find the Duplicate Number', 'Next Permutation', 'Merge Intervals', 'Insert Interval', 'Non-overlapping Intervals', 'Maximum Product Subarray', 'Longest Consecutive Sequence', 'Valid Sudoku', 'LRU Cache', 'Kth Largest Element in an Array'] },
  { topics: 'Two Pointers', target: '10-12', notes: 'Palindrome, container with most water, 3Sum.', problems: ['Valid Palindrome', 'Two Sum II - Input Array Is Sorted', '3Sum', 'Container With Most Water', 'Trapping Rain Water', 'Linked List Cycle', 'Remove Nth Node From End of List', 'Sort Colors', 'Merge Sorted Array', 'Palindrome Linked List'] },
  { topics: 'Sliding Window', target: '10-12', notes: 'Fixed + variable length, substring problems.', problems: ['Best Time to Buy and Sell Stock', 'Longest Substring Without Repeating Characters', 'Longest Repeating Character Replacement', 'Permutation in String', 'Minimum Window Substring', 'Sliding Window Maximum', 'Find All Anagrams in a String', 'Minimum Size Subarray Sum', 'Fruit Into Baskets', 'Maximum Average Subarray I'] },
  { topics: 'Binary Search', target: '8-10', notes: 'Standard, search 2D, find min in rotated.', problems: ['Binary Search', 'Search a 2D Matrix', 'Koko Eating Bananas', 'Find Minimum in Rotated Sorted Array', 'Search in Rotated Sorted Array', 'Time Based Key-Value Store', 'Median of Two Sorted Arrays', 'Pow(x, n)', 'Find Peak Element'] },
  { topics: 'Stack / Queue', target: '10-12', notes: 'Valid parentheses, daily temperatures, monotonic stack.', problems: ['Valid Parentheses', 'Min Stack', 'Evaluate Reverse Polish Notation', 'Generate Parentheses', 'Daily Temperatures', 'Car Fleet', 'Largest Rectangle in Histogram', 'Implement Queue using Stacks', 'Next Greater Element I', 'Asteroid Collision'] },
  { topics: 'Revision Week (topics 1-6)', target: '15 mixed', notes: 'Re-solve flagged problems + weak areas.', revision: true, problems: [] },
  { topics: 'Linked Lists', target: '10-12', notes: 'Reverse, cycle, intersection, merge.', problems: ['Reverse Linked List', 'Merge Two Sorted Lists', 'Linked List Cycle', 'Reorder List', 'Remove Nth Node From End of List', 'Copy List with Random Pointer', 'Add Two Numbers', 'Find the Duplicate Number', 'LRU Cache', 'Merge k Sorted Lists'] },
  { topics: 'Trees (DFS/BFS)', target: '12-15', notes: 'Traversals, max depth, diameter, LCA.', problems: ['Invert Binary Tree', 'Maximum Depth of Binary Tree', 'Diameter of Binary Tree', 'Balanced Binary Tree', 'Same Tree', 'Subtree of Another Tree', 'Lowest Common Ancestor of a Binary Search Tree', 'Binary Tree Level Order Traversal', 'Binary Tree Right Side View', 'Count Good Nodes in Binary Tree', 'Validate Binary Search Tree', 'Kth Smallest Element in a BST'] },
  { topics: 'BST + Heaps', target: '10-12', notes: 'BST validation, Kth smallest, top K, merge K lists.', problems: ['Validate Binary Search Tree', 'Kth Smallest Element in a BST', 'Construct Binary Tree from Preorder and Inorder Traversal', 'Binary Tree Maximum Path Sum', 'Kth Largest Element in an Array', 'Last Stone Weight', 'K Closest Points to Origin', 'Task Scheduler', 'Design Twitter', 'Merge k Sorted Lists'] },
  { topics: 'Graphs (DFS, BFS, Union-Find)', target: '12-15', notes: 'Number of islands, course schedule, cycle detection.', problems: ['Number of Islands', 'Clone Graph', 'Max Area of Island', 'Pacific Atlantic Water Flow', 'Surrounded Regions', 'Rotting Oranges', 'Walls and Gates', 'Course Schedule', 'Course Schedule II', 'Redundant Connection', 'Number of Connected Components in an Undirected Graph', 'Graph Valid Tree', 'Word Ladder'] },
  { topics: 'Revision Week (topics 8-11)', target: '15 mixed', notes: 'Re-solve Graphs + Trees + Heaps.', revision: true, problems: [] },
  { topics: 'Dynamic Programming (1D)', target: '10-12', notes: 'Climbing stairs, house robber, max subarray.', problems: ['Climbing Stairs', 'Min Cost Climbing Stairs', 'House Robber', 'House Robber II', 'Longest Palindromic Substring', 'Palindromic Substrings', 'Decode Ways', 'Coin Change', 'Maximum Product Subarray', 'Word Break', 'Longest Increasing Subsequence'] },
  { topics: 'Dynamic Programming (2D + Knapsack)', target: '10-12', notes: 'LCS, edit distance, coin change.', problems: ['Unique Paths', 'Longest Common Subsequence', 'Best Time to Buy and Sell Stock with Cooldown', 'Coin Change II', 'Target Sum', 'Interleaving String', 'Edit Distance', 'Longest Increasing Path in a Matrix', 'Distinct Subsequences', 'Regular Expression Matching'] },
  { topics: 'Backtracking / Strings', target: '8-10', notes: 'Subsets, permutations, palindrome partitioning.', problems: ['Subsets', 'Combination Sum', 'Permutations', 'Subsets II', 'Combination Sum II', 'Word Search', 'Palindrome Partitioning', 'Letter Combinations of a Phone Number', 'N-Queens', 'Word Break'] },
  { topics: 'Final Revision + Mock Exam', target: '20-30', notes: 'Random hard + topic mix, timed contests.', revision: true, problems: ['Trapping Rain Water', 'Minimum Window Substring', 'Median of Two Sorted Arrays', 'Largest Rectangle in Histogram', 'Binary Tree Maximum Path Sum', 'Serialize and Deserialize Binary Tree', 'Word Ladder', 'Edit Distance', 'Regular Expression Matching', 'Merge k Sorted Lists'] }
];

export function generateWeeklyRoadmap(startDate = DEFAULT_START) {
  const [y, m, d] = startDate.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  return rawWeeks.map((w, i) => {
    const weekStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i * 7));
    const weekEnd = new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate() + 6));
    const fmtDate = (date) => {
      const yyyy = date.getUTCFullYear();
      const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(date.getUTCDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    };
    const fmtDisplay = (date) => {
      return new Date(date.getTime()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    };
    return {
      week: i + 1,
      dates: `${fmtDisplay(weekStart)} - ${fmtDisplay(weekEnd)}`,
      start: fmtDate(weekStart),
      end: fmtDate(weekEnd),
      topics: w.topics,
      target: w.target,
      notes: w.notes,
      revision: w.revision || false,
      problems: w.problems
    };
  });
}

export const weeklyRoadmap = generateWeeklyRoadmap();
export { DEFAULT_START, DEADLINE };
