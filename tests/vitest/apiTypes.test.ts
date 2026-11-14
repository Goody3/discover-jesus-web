import { expectTypeOf, it } from "vitest";
import type { ApiRequestBody, ApiResponse, Component, PageSummary } from "../../src/api";

it("derives successful responses from their HTTP operations", () => {
  expectTypeOf<ApiResponse<"GetPages">>().toEqualTypeOf<PageSummary[]>();
  expectTypeOf<ApiResponse<"GetHealth">>().toEqualTypeOf<{ status: string }>();
  expectTypeOf<ApiResponse<"DeletePage">>().toEqualTypeOf<void>();
  expectTypeOf<ApiResponse<"CreatePage" | "CreateComponent">>().toEqualTypeOf<
    PageSummary | Component
  >();
});

it("keeps typed requests and opaque JSON distinct", () => {
  expectTypeOf<ApiRequestBody<"CreatePage">>().toEqualTypeOf<{
    slug: string;
    title: string;
    isPublished: boolean;
  }>();
  expectTypeOf<ApiRequestBody<"CreateComponent">["props"]>().toEqualTypeOf<unknown>();
  expectTypeOf<Component["props"]>().toEqualTypeOf<unknown>();
  expectTypeOf<ApiResponse<"GetPageContent">["sections"]>().toEqualTypeOf<unknown>();
  expectTypeOf<ApiResponse<"GetReusableComponent">["content"]>().toEqualTypeOf<unknown>();
  expectTypeOf<ApiRequestBody<"GetPages">>().toEqualTypeOf<never>();
});
