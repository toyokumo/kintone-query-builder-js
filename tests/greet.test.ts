import { sayHello } from "../src/greet";

describe('greet', function() {
  it('sayHello', function() {
      let result = sayHello('hoge');
      expect(result).toBe('Hello from hoge');
  })});
