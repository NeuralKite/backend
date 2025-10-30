import { Test, TestingModule } from '@nestjs/testing';

    expect(summary.totalItems).toBe(2);
    expect(summary.totalQuantity).toBe(3);
    expect(summary.subtotal).toBe(200);
  });


    expect(summary.discountAmount).toBe(10);
    expect(summary.total).toBe(90);
  });
});
