const push      = jest.fn();
const replace   = jest.fn();
const refresh   = jest.fn();
const back      = jest.fn();
const forward   = jest.fn();

module.exports = {
  // hooks you use in your code
  useRouter: () => ({
    push,
    replace,
    refresh,
    back,
    forward,
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams:       () => ({}),
  usePathname:     () => "/",
  redirect:        jest.fn(),
  notFound:        jest.fn(),
};
