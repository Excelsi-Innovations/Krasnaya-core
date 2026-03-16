import { Test, TestingModule } from '@nestjs/testing';
import { AstService } from './ast.service';
import { BadRequestException } from '@nestjs/common';

describe('AstService', () => {
  let service: AstService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AstService],
    }).compile();

    service = module.get<AstService>(AstService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateAst', () => {
    it('should validate a correct PrimitiveOp (sum)', () => {
      const validAst = { type: 'sum', left: 1, right: 2 };
      const result = service.validateAst(validAst);
      expect(result).toEqual(validAst);
    });

    it('should validate a correct UIOp (say)', () => {
      const validAst = { type: 'say', text: 'Hello World' };
      const result = service.validateAst(validAst);
      expect(result).toEqual(validAst);
    });

    it('should throw BadRequestException for invalid AST', () => {
      const invalidAst = { type: 'unknown' };
      expect(() => service.validateAst(invalidAst)).toThrow(BadRequestException);
    });

    it('should throw BadRequestException for missing required fields', () => {
      const invalidAst = { type: 'sum' }; // missing left, right
      expect(() => service.validateAst(invalidAst)).toThrow(BadRequestException);
    });
  });
});
