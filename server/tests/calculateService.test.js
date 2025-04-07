const { calculateExpenses } = require('../services/calculateService');

describe('Calculate Service', () => {
  // Test data
  const testEvent = {
    eventId: 'event1',
    eventName: 'Test Event',
    memberIds: ['member1', 'member2', 'member3']
  };

  const testMembers = [
    { memberId: 'member1', memberName: 'Alice' },
    { memberId: 'member2', memberName: 'Bob' },
    { memberId: 'member3', memberName: 'Charlie' }
  ];

  const testFees = [
    { 
      feeId: 'fee1', 
      feeName: 'Dinner', 
      price: 90, 
      paidBy: 'member1', 
      memberIds: ['member1', 'member2', 'member3'],
      eventId: 'event1'
    },
    { 
      feeId: 'fee2', 
      feeName: 'Taxi', 
      price: 30, 
      paidBy: 'member2', 
      memberIds: ['member1', 'member2'],
      eventId: 'event1'
    }
  ];

  test('should calculate expenses correctly', () => {
    const result = calculateExpenses(testEvent, testMembers, testFees);
    
    // Verify the result has transactions
    expect(result).toHaveProperty('transactions');
    expect(Array.isArray(result.transactions)).toBe(true);
    
    // Verify the correct number of transactions
    // In this case, we expect 2 transactions:
    // 1. Charlie pays Alice $30
    // 2. Bob pays Alice $15
    expect(result.transactions.length).toBe(2);
    
    // Find the transaction where Charlie pays Alice
    const charlieToAlice = result.transactions.find(
      t => t.fromName === 'Charlie' && t.toName === 'Alice'
    );
    expect(charlieToAlice).toBeDefined();
    expect(charlieToAlice.amount).toBeCloseTo(30, 2);
    
    // Find the transaction where Bob pays Alice
    const bobToAlice = result.transactions.find(
      t => t.fromName === 'Bob' && t.toName === 'Alice'
    );
    expect(bobToAlice).toBeDefined();
    expect(bobToAlice.amount).toBeCloseTo(15, 2);
  });

  test('should handle empty fees array', () => {
    const result = calculateExpenses(testEvent, testMembers, []);
    
    expect(result).toHaveProperty('transactions');
    expect(Array.isArray(result.transactions)).toBe(true);
    expect(result.transactions.length).toBe(0);
  });

  test('should handle fees with no paidBy member', () => {
    const feesWithNoPayer = [
      { 
        feeId: 'fee1', 
        feeName: 'Dinner', 
        price: 90, 
        paidBy: null, 
        memberIds: ['member1', 'member2', 'member3'],
        eventId: 'event1'
      }
    ];
    
    expect(() => {
      calculateExpenses(testEvent, testMembers, feesWithNoPayer);
    }).toThrow();
  });

  test('should handle fees with invalid member IDs', () => {
    const feesWithInvalidMembers = [
      { 
        feeId: 'fee1', 
        feeName: 'Dinner', 
        price: 90, 
        paidBy: 'member1', 
        memberIds: ['member1', 'invalid-member'],
        eventId: 'event1'
      }
    ];
    
    expect(() => {
      calculateExpenses(testEvent, testMembers, feesWithInvalidMembers);
    }).toThrow();
  });

  test('should handle fees with zero price', () => {
    const feesWithZeroPrice = [
      { 
        feeId: 'fee1', 
        feeName: 'Free Dinner', 
        price: 0, 
        paidBy: 'member1', 
        memberIds: ['member1', 'member2', 'member3'],
        eventId: 'event1'
      }
    ];
    
    const result = calculateExpenses(testEvent, testMembers, feesWithZeroPrice);
    expect(result.transactions.length).toBe(0);
  });

  test('should handle complex expense scenarios', () => {
    const complexFees = [
      { 
        feeId: 'fee1', 
        feeName: 'Dinner', 
        price: 90, 
        paidBy: 'member1', 
        memberIds: ['member1', 'member2', 'member3'],
        eventId: 'event1'
      },
      { 
        feeId: 'fee2', 
        feeName: 'Taxi', 
        price: 30, 
        paidBy: 'member2', 
        memberIds: ['member1', 'member2'],
        eventId: 'event1'
      },
      { 
        feeId: 'fee3', 
        feeName: 'Hotel', 
        price: 150, 
        paidBy: 'member3', 
        memberIds: ['member1', 'member2', 'member3'],
        eventId: 'event1'
      }
    ];
    
    const result = calculateExpenses(testEvent, testMembers, complexFees);
    
    // Verify the result has transactions
    expect(result).toHaveProperty('transactions');
    expect(Array.isArray(result.transactions)).toBe(true);
    
    // Calculate expected balances
    // Alice paid 90, owes (90/3 + 30/2 + 150/3) = 30 + 15 + 50 = 95, net = -5
    // Bob paid 30, owes (90/3 + 30/2 + 150/3) = 30 + 15 + 50 = 95, net = -65
    // Charlie paid 150, owes (90/3 + 0 + 150/3) = 30 + 0 + 50 = 80, net = 70
    // So Charlie should receive from Bob and Alice
    
    // Verify total amount transferred equals the sum of absolute balances / 2
    const totalTransferred = result.transactions.reduce((sum, t) => sum + t.amount, 0);
    expect(totalTransferred).toBeCloseTo(70, 2); // 5 + 65 = 70
    
    // Verify that after all transactions, everyone is even (or close to even due to rounding)
    // This is a more complex check that would require tracking balances after each transaction
  });
});