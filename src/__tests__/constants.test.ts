import { ASYNC_RESET_INDICATOR, customAsyncTasks, validate } from '../constants';

// tslint:disable: no-string-literal

describe('constants', () => {
  describe('ASYNC_RESET_INDICATOR', () => {
    it('should set passed properties', () => {
      expect(ASYNC_RESET_INDICATOR.key).toBeDefined();
    });
  });

  describe('validate', () => {
    describe('Promise', () => {
      it('should be defined', () => {
        expect(validate.Promise).toBeDefined();
      });
    });

    describe('formatters', () => {
      describe('mapped', () => {
        it('should be defined', () => {
          expect(validate.formatters.mapped).toBeDefined();
        });

        it('should return object', () => {
          expect(typeof validate.formatters.mapped([])).toBe('object');
        });

        it('should turn attribute to object keys and assign error as value', () => {
          const result = validate.formatters.mapped([
            {
              attribute: 'username',
              value: 'nicklas',
              validator: 'exclusion',
              attributes: {
                username: 'nicklas',
                password: 'bad',
              },
              error: "Username 'nicklas' is not allowed",
            },
          ]);
          expect(result.username).toBeDefined();
          expect(result.username).toEqual({ exclusion: "Username 'nicklas' is not allowed" });
        });
      });
    });

    describe('validators', () => {
      describe('custom', () => {
        it('should return null if options is not set', () => {
          expect(validate.validators.custom('', null, 'name', { name: '' })).toBe(null);
        });

        it('should be defined', () => {
          expect(validate.validators.custom).toBeDefined();
        });
      });

      describe('customAsync', () => {
        it('should be defined', () => {
          expect(validate.validators.customAsync).toBeDefined();
        });

        const options = jest.fn((resolve: any) => resolve());
        const cus = validate.validators.customAsync('', options, 'name', { name: '' }, { instanceCount: 1 });
        it('should be instance of Promise', () => {
          expect(cus).toBeInstanceOf(validate.Promise);
        });

        it('should call options function', () => {
          expect(options).toBeCalled();
        });

        it('should set customAsyncTasks property with property name and instanceCount', (done) => {
          cus.then(() => {
            expect(customAsyncTasks['name1']).toBeDefined();
            expect(typeof customAsyncTasks['name1']).toBe('function');
            done();
          });
        });

        it('should replace customAsyncTasks property function when called again', (done) => {
          cus.then(() => {
            const prevATaskFunc = customAsyncTasks['name1'];

            validate.validators.customAsync('', options, 'name', { name: '' }, { instanceCount: 1 }).then(() => {
              expect(customAsyncTasks['name1']).toBeDefined();
              expect(typeof customAsyncTasks['name1']).not.toBe(prevATaskFunc);
              done();
            });
          });
        });
      });

      describe('equality', () => {
        it('should set default message', () => {
          expect(validate.validators.equality.message).toBeDefined();
          expect(typeof validate.validators.equality.message).toBe('string');
        });
      });

      describe('presence', () => {
        it('should set default message', () => {
          expect(validate.validators.presence.message).toBeDefined();
          expect(typeof validate.validators.presence.message).toBe('string');
        });
      });

      describe('datetime', () => {
        const { datetime } = validate.validators;

        it('should be extended', () => {
          expect(datetime?.parse).toBeDefined();
          expect(typeof datetime?.parse).toBe('function');
          expect(datetime?.format).toBeDefined();
          expect(typeof datetime?.format).toBe('function');
        });

        it('should parse string to timestamp', () => {
          expect(datetime?.parse('2020', { dateOnly: true })).toBe(NaN);
          expect(typeof datetime?.parse('2020-10-20', { dateOnly: true })).toBe('number');
        });

        it('should format datetime properly', () => {
          expect(datetime?.format(datetime?.parse('2020-10-20', { dateOnly: true }), { dateOnly: true })).toBe(
            '2020-10-20',
          );
          expect(datetime?.format(datetime?.parse('2020-10-20', { dateOnly: false }), { dateOnly: false })).toBe(
            '2020-10-20 00:00:00',
          );
          expect(
            datetime?.format(datetime?.parse('2020-10-20 13:30:45', { dateOnly: false }), { dateOnly: false }),
          ).toBe('2020-10-20 13:30:45');
        });
      });
    });
  });
});
