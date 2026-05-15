import { uid, normalizeProblemName } from '../utils.js';

export let sheetProblems = [
  { id: 'nc-contains-duplicate', sheet: 'NeetCode 150', name: 'Contains Duplicate', number: 217, difficulty: 'Easy', topic: 'Hashing', url: 'https://leetcode.com/problems/contains-duplicate/' },
  { id: 'nc-valid-anagram', sheet: 'NeetCode 150', name: 'Valid Anagram', number: 242, difficulty: 'Easy', topic: 'Strings', url: 'https://leetcode.com/problems/valid-anagram/' },
  { id: 'nc-two-sum', sheet: 'NeetCode 150', name: 'Two Sum', number: 1, difficulty: 'Easy', topic: 'Arrays', url: 'https://leetcode.com/problems/two-sum/' },
  { id: 'nc-group-anagrams', sheet: 'NeetCode 150', name: 'Group Anagrams', number: 49, difficulty: 'Medium', topic: 'Hashing', url: 'https://leetcode.com/problems/group-anagrams/' },
  { id: 'nc-top-k-frequent', sheet: 'NeetCode 150', name: 'Top K Frequent Elements', number: 347, difficulty: 'Medium', topic: 'Heaps', url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
  { id: 'nc-product-array', sheet: 'NeetCode 150', name: 'Product of Array Except Self', number: 238, difficulty: 'Medium', topic: 'Arrays', url: 'https://leetcode.com/problems/product-of-array-except-self/' },
  { id: 'nc-valid-palindrome', sheet: 'NeetCode 150', name: 'Valid Palindrome', number: 125, difficulty: 'Easy', topic: 'Two Pointers', url: 'https://leetcode.com/problems/valid-palindrome/' },
  { id: 'nc-three-sum', sheet: 'NeetCode 150', name: '3Sum', number: 15, difficulty: 'Medium', topic: 'Two Pointers', url: 'https://leetcode.com/problems/3sum/' },
  { id: 'nc-container-water', sheet: 'NeetCode 150', name: 'Container With Most Water', number: 11, difficulty: 'Medium', topic: 'Two Pointers', url: 'https://leetcode.com/problems/container-with-most-water/' },
  { id: 'nc-longest-substring', sheet: 'NeetCode 150', name: 'Longest Substring Without Repeating Characters', number: 3, difficulty: 'Medium', topic: 'Sliding Window', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  { id: 'nc-valid-parentheses', sheet: 'NeetCode 150', name: 'Valid Parentheses', number: 20, difficulty: 'Easy', topic: 'Other', url: 'https://leetcode.com/problems/valid-parentheses/' },
  { id: 'nc-binary-search', sheet: 'NeetCode 150', name: 'Binary Search', number: 704, difficulty: 'Easy', topic: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/' },
  { id: 'nc-invert-tree', sheet: 'NeetCode 150', name: 'Invert Binary Tree', number: 226, difficulty: 'Easy', topic: 'Trees', url: 'https://leetcode.com/problems/invert-binary-tree/' },
  { id: 'nc-max-depth', sheet: 'NeetCode 150', name: 'Maximum Depth of Binary Tree', number: 104, difficulty: 'Easy', topic: 'Trees', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
  { id: 'nc-clone-graph', sheet: 'NeetCode 150', name: 'Clone Graph', number: 133, difficulty: 'Medium', topic: 'Graphs', url: 'https://leetcode.com/problems/clone-graph/' },
  { id: 'nc-course-schedule', sheet: 'NeetCode 150', name: 'Course Schedule', number: 207, difficulty: 'Medium', topic: 'Graphs', url: 'https://leetcode.com/problems/course-schedule/' },
  { id: 'nc-climbing-stairs', sheet: 'NeetCode 150', name: 'Climbing Stairs', number: 70, difficulty: 'Easy', topic: 'DP', url: 'https://leetcode.com/problems/climbing-stairs/' },
  { id: 'nc-coin-change', sheet: 'NeetCode 150', name: 'Coin Change', number: 322, difficulty: 'Medium', topic: 'DP', url: 'https://leetcode.com/problems/coin-change/' },
  { id: 'str-set-matrix-zeroes', sheet: 'Striver SDE Sheet', name: 'Set Matrix Zeroes', number: 73, difficulty: 'Medium', topic: 'Arrays', url: 'https://leetcode.com/problems/set-matrix-zeroes/' },
  { id: 'str-pascals-triangle', sheet: 'Striver SDE Sheet', name: "Pascal's Triangle", number: 118, difficulty: 'Easy', topic: 'Arrays', url: 'https://leetcode.com/problems/pascals-triangle/' },
  { id: 'str-next-permutation', sheet: 'Striver SDE Sheet', name: 'Next Permutation', number: 31, difficulty: 'Medium', topic: 'Arrays', url: 'https://leetcode.com/problems/next-permutation/' },
  { id: 'str-kadanes', sheet: 'Striver SDE Sheet', name: 'Maximum Subarray', number: 53, difficulty: 'Medium', topic: 'Arrays', url: 'https://leetcode.com/problems/maximum-subarray/' },
  { id: 'str-sort-colors', sheet: 'Striver SDE Sheet', name: 'Sort Colors', number: 75, difficulty: 'Medium', topic: 'Two Pointers', url: 'https://leetcode.com/problems/sort-colors/' },
  { id: 'str-merge-intervals', sheet: 'Striver SDE Sheet', name: 'Merge Intervals', number: 56, difficulty: 'Medium', topic: 'Other', url: 'https://leetcode.com/problems/merge-intervals/' },
  { id: 'str-merge-sorted-array', sheet: 'Striver SDE Sheet', name: 'Merge Sorted Array', number: 88, difficulty: 'Easy', topic: 'Two Pointers', url: 'https://leetcode.com/problems/merge-sorted-array/' },
  { id: 'str-repeat-missing', sheet: 'Striver SDE Sheet', name: 'Find the Duplicate Number', number: 287, difficulty: 'Medium', topic: 'Arrays', url: 'https://leetcode.com/problems/find-the-duplicate-number/' },
  { id: 'str-search-2d', sheet: 'Striver SDE Sheet', name: 'Search a 2D Matrix', number: 74, difficulty: 'Medium', topic: 'Binary Search', url: 'https://leetcode.com/problems/search-a-2d-matrix/' },
  { id: 'str-pow', sheet: 'Striver SDE Sheet', name: 'Pow(x, n)', number: 50, difficulty: 'Medium', topic: 'Other', url: 'https://leetcode.com/problems/powx-n/' },
  { id: 'str-majority', sheet: 'Striver SDE Sheet', name: 'Majority Element', number: 169, difficulty: 'Easy', topic: 'Arrays', url: 'https://leetcode.com/problems/majority-element/' },
  { id: 'str-reverse-linked-list', sheet: 'Striver SDE Sheet', name: 'Reverse Linked List', number: 206, difficulty: 'Easy', topic: 'Other', url: 'https://leetcode.com/problems/reverse-linked-list/' },
  { id: 'str-linked-cycle', sheet: 'Striver SDE Sheet', name: 'Linked List Cycle', number: 141, difficulty: 'Easy', topic: 'Two Pointers', url: 'https://leetcode.com/problems/linked-list-cycle/' },
  { id: 'str-lru-cache', sheet: 'Striver SDE Sheet', name: 'LRU Cache', number: 146, difficulty: 'Medium', topic: 'Hashing', url: 'https://leetcode.com/problems/lru-cache/' },
  { id: 'str-valid-parentheses', sheet: 'Striver SDE Sheet', name: 'Valid Parentheses', number: 20, difficulty: 'Easy', topic: 'Other', url: 'https://leetcode.com/problems/valid-parentheses/' },
  { id: 'str-kth-largest', sheet: 'Striver SDE Sheet', name: 'Kth Largest Element in an Array', number: 215, difficulty: 'Medium', topic: 'Heaps', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
  { id: 'str-serialize-tree', sheet: 'Striver SDE Sheet', name: 'Serialize and Deserialize Binary Tree', number: 297, difficulty: 'Hard', topic: 'Trees', url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },
  { id: 'str-word-ladder', sheet: 'Striver SDE Sheet', name: 'Word Ladder', number: 127, difficulty: 'Hard', topic: 'Graphs', url: 'https://leetcode.com/problems/word-ladder/' }
];

function addSheetBatch(sheet, topic, items) {
  const existing = new Set(sheetProblems.map(p => `${p.sheet}|${normalizeProblemName(p.name)}`));
  items.forEach(item => {
    const name = typeof item === 'string' ? item : item.name;
    const key = `${sheet}|${normalizeProblemName(name)}`;
    if (existing.has(key)) return;
    existing.add(key);
    sheetProblems.push({
      id: `${sheet.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      sheet,
      name,
      number: item.number || '',
      difficulty: item.difficulty || 'Medium',
      topic: item.topic || topic,
      url: item.url || `https://leetcode.com/problems/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}/`
    });
  });
}

addSheetBatch('NeetCode 150', 'Hashing', [
  { name: 'Valid Sudoku' }, { name: 'Encode and Decode Strings' }, { name: 'Longest Consecutive Sequence' }
]);
addSheetBatch('NeetCode 150', 'Two Pointers', [
  { name: 'Two Sum II - Input Array Is Sorted' }, { name: 'Trapping Rain Water', difficulty: 'Hard' }
]);
addSheetBatch('NeetCode 150', 'Sliding Window', [
  { name: 'Best Time to Buy and Sell Stock', difficulty: 'Easy' }, { name: 'Longest Repeating Character Replacement' }, { name: 'Permutation in String' }, { name: 'Minimum Window Substring', difficulty: 'Hard' }, { name: 'Sliding Window Maximum', difficulty: 'Hard' }
]);
addSheetBatch('NeetCode 150', 'Other', [
  { name: 'Min Stack' }, { name: 'Evaluate Reverse Polish Notation' }, { name: 'Generate Parentheses' }, { name: 'Daily Temperatures' }, { name: 'Car Fleet' }, { name: 'Largest Rectangle in Histogram', difficulty: 'Hard' }
]);
addSheetBatch('NeetCode 150', 'Binary Search', [
  { name: 'Search a 2D Matrix' }, { name: 'Koko Eating Bananas' }, { name: 'Find Minimum in Rotated Sorted Array' }, { name: 'Search in Rotated Sorted Array' }, { name: 'Time Based Key-Value Store' }, { name: 'Median of Two Sorted Arrays', difficulty: 'Hard' }
]);
addSheetBatch('NeetCode 150', 'Other', [
  { name: 'Merge Two Sorted Lists', difficulty: 'Easy' }, { name: 'Reorder List' }, { name: 'Remove Nth Node From End of List' }, { name: 'Copy List with Random Pointer' }, { name: 'Add Two Numbers' }, { name: 'Reverse Nodes in k-Group', difficulty: 'Hard' }
]);
addSheetBatch('NeetCode 150', 'Trees', [
  { name: 'Diameter of Binary Tree', difficulty: 'Easy' }, { name: 'Balanced Binary Tree', difficulty: 'Easy' }, { name: 'Same Tree', difficulty: 'Easy' }, { name: 'Subtree of Another Tree', difficulty: 'Easy' }, { name: 'Lowest Common Ancestor of a Binary Search Tree' }, { name: 'Binary Tree Level Order Traversal' }, { name: 'Binary Tree Right Side View' }, { name: 'Count Good Nodes in Binary Tree' }, { name: 'Validate Binary Search Tree' }, { name: 'Kth Smallest Element in a BST' }, { name: 'Construct Binary Tree from Preorder and Inorder Traversal' }, { name: 'Binary Tree Maximum Path Sum', difficulty: 'Hard' }
]);
addSheetBatch('NeetCode 150', 'Other', [
  { name: 'Implement Trie (Prefix Tree)' }, { name: 'Design Add and Search Words Data Structure' }, { name: 'Word Search II', difficulty: 'Hard' }
]);
addSheetBatch('NeetCode 150', 'Heaps', [
  { name: 'Kth Largest Element in a Stream', difficulty: 'Easy' }, { name: 'Last Stone Weight', difficulty: 'Easy' }, { name: 'K Closest Points to Origin' }, { name: 'Task Scheduler' }, { name: 'Design Twitter' }, { name: 'Find Median from Data Stream', difficulty: 'Hard' }
]);
addSheetBatch('NeetCode 150', 'Other', [
  { name: 'Subsets' }, { name: 'Combination Sum' }, { name: 'Combination Sum II' }, { name: 'Permutations' }, { name: 'Subsets II' }, { name: 'Word Search' }, { name: 'Palindrome Partitioning' }, { name: 'Letter Combinations of a Phone Number' }, { name: 'N-Queens', difficulty: 'Hard' }
]);
addSheetBatch('NeetCode 150', 'Graphs', [
  { name: 'Number of Islands' }, { name: 'Max Area of Island' }, { name: 'Walls and Gates' }, { name: 'Rotting Oranges' }, { name: 'Pacific Atlantic Water Flow' }, { name: 'Surrounded Regions' }, { name: 'Course Schedule II' }, { name: 'Graph Valid Tree' }, { name: 'Number of Connected Components in an Undirected Graph' }, { name: 'Redundant Connection' }, { name: 'Reconstruct Itinerary', difficulty: 'Hard' }, { name: 'Min Cost to Connect All Points' }, { name: 'Network Delay Time' }, { name: 'Swim in Rising Water', difficulty: 'Hard' }, { name: 'Alien Dictionary', difficulty: 'Hard' }, { name: 'Cheapest Flights Within K Stops' }
]);
addSheetBatch('NeetCode 150', 'DP', [
  { name: 'Min Cost Climbing Stairs', difficulty: 'Easy' }, { name: 'House Robber' }, { name: 'House Robber II' }, { name: 'Longest Palindromic Substring' }, { name: 'Palindromic Substrings' }, { name: 'Decode Ways' }, { name: 'Maximum Product Subarray' }, { name: 'Word Break' }, { name: 'Longest Increasing Subsequence' }, { name: 'Partition Equal Subset Sum' }, { name: 'Unique Paths' }, { name: 'Longest Common Subsequence' }, { name: 'Best Time to Buy and Sell Stock with Cooldown' }, { name: 'Coin Change II' }, { name: 'Target Sum' }, { name: 'Interleaving String' }, { name: 'Longest Increasing Path in a Matrix', difficulty: 'Hard' }, { name: 'Distinct Subsequences', difficulty: 'Hard' }, { name: 'Edit Distance' }, { name: 'Burst Balloons', difficulty: 'Hard' }, { name: 'Regular Expression Matching', difficulty: 'Hard' }
]);
addSheetBatch('NeetCode 150', 'Other', [
  { name: 'Insert Interval' }, { name: 'Non-overlapping Intervals' }, { name: 'Meeting Rooms', difficulty: 'Easy' }, { name: 'Meeting Rooms II' }, { name: 'Minimum Interval to Include Each Query', difficulty: 'Hard' }, { name: 'Jump Game' }, { name: 'Jump Game II' }, { name: 'Gas Station' }, { name: 'Hand of Straights' }, { name: 'Merge Triplets to Form Target Triplet' }, { name: 'Partition Labels' }, { name: 'Valid Parenthesis String' }, { name: 'Rotate Image' }, { name: 'Spiral Matrix' }, { name: 'Happy Number', difficulty: 'Easy' }, { name: 'Plus One', difficulty: 'Easy' }, { name: 'Multiply Strings' }, { name: 'Detect Squares' }, { name: 'Single Number', difficulty: 'Easy' }, { name: 'Number of 1 Bits', difficulty: 'Easy' }, { name: 'Counting Bits', difficulty: 'Easy' }, { name: 'Reverse Bits', difficulty: 'Easy' }, { name: 'Missing Number', difficulty: 'Easy' }, { name: 'Sum of Two Integers' }, { name: 'Reverse Integer' }
]);
addSheetBatch('NeetCode 150', 'Other', [
  { name: 'Reverse Linked List', difficulty: 'Easy' }, { name: 'Linked List Cycle', difficulty: 'Easy' }, { name: 'Find the Duplicate Number' }, { name: 'LRU Cache' }, { name: 'Merge k Sorted Lists', difficulty: 'Hard' }, { name: 'Serialize and Deserialize Binary Tree', difficulty: 'Hard' }, { name: 'Kth Largest Element in an Array' }, { name: 'Word Ladder', difficulty: 'Hard' }, { name: 'Merge Intervals' }, { name: 'Maximum Subarray' }, { name: 'Set Matrix Zeroes' }, { name: 'Pow(x, n)' }
]);

addSheetBatch('Striver SDE Sheet', 'Other', [
  { name: 'N meetings in one room' }, { name: 'Minimum Platforms' }, { name: 'Job Sequencing Problem' }, { name: 'Fractional Knapsack' }, { name: 'Greedy Algorithm to Find Minimum Number of Coins' }, { name: 'Activity Selection' }, { name: 'Subset Sums' }, { name: 'M-Coloring Problem' }, { name: 'Rat in a Maze' }, { name: 'Sudoku Solver', difficulty: 'Hard' }, { name: 'Count Inversions', difficulty: 'Hard' }, { name: 'Reverse Pairs', difficulty: 'Hard' }, { name: 'Aggressive Cows' }, { name: 'Allocate Books' }, { name: 'Painter Partition Problem' }, { name: 'Median of Two Sorted Arrays', difficulty: 'Hard' }, { name: 'Kth Element of Two Sorted Arrays' }, { name: 'Flattening a Linked List' }, { name: 'Rotate a Linked List' }, { name: 'Clone Linked List with Random Pointer' }, { name: 'Intersection of Two Linked Lists' }, { name: 'Palindrome Linked List' }, { name: 'Starting Point of Loop in Linked List' }, { name: 'Reverse Nodes in k-Group', difficulty: 'Hard' }, { name: 'The Celebrity Problem' }, { name: 'Maximum of Minimum for Every Window Size' }, { name: 'Implement Min Stack' }, { name: 'Rotten Oranges' }, { name: 'Flood Fill' }, { name: 'Bipartite Graph' }, { name: 'Detect Cycle in Directed Graph' }, { name: 'Topological Sort' }, { name: 'Dijkstra Algorithm' }, { name: 'Bellman Ford Algorithm' }, { name: 'Floyd Warshall Algorithm' }, { name: 'Minimum Spanning Tree' }, { name: 'Disjoint Set Union' }, { name: 'Strongly Connected Components', difficulty: 'Hard' }, { name: 'Maximum Product Subarray' }, { name: 'Longest Increasing Subsequence' }, { name: 'Longest Common Subsequence' }, { name: '0/1 Knapsack' }, { name: 'Edit Distance' }, { name: 'Matrix Chain Multiplication', difficulty: 'Hard' }, { name: 'Palindrome Partitioning II', difficulty: 'Hard' }
]);

export async function loadSheetDataset() {
  try {
    const res = await fetch('/data/sheets.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.problems) || !data.problems.length) throw new Error('Invalid sheet data');
    sheetProblems = data.problems;
  } catch (err) {
    console.warn('Using embedded sheet fallback:', err.message);
  }
}
