import { Pagination } from "@kobalte/core";
import { type Component } from "solid-js";

export type MatchPaginationProps = {
  currentUrl: string;
  page: number;
  totalPages: number;
};

export const MatchPagination: Component<MatchPaginationProps> = (props) => {
  const getPageUrl = (page: number) => {
    const url = new URL(props.currentUrl);
    const sp = new URLSearchParams(url.search);

    sp.set("page", page.toString());
    url.search = sp.toString();

    return url.toString();
  };

  return (
    <Pagination.Root
      defaultPage={props.page}
      fixedItems
      itemComponent={(itemProps) => (
        <Pagination.Item
          class="flex items-center justify-center h-10 w-10 rounded-md data-[current]:bg-stats-bg-dark data-[current]:border-2 data-[current]:border-orange-400 hover:bg-stats-bg"
          page={itemProps.page}
          as="a"
          href={getPageUrl(itemProps.page)}
        >
          {itemProps.page}
        </Pagination.Item>
      )}
      ellipsisComponent={() => (
        <Pagination.Ellipsis class="h-10 px-4 flex items-center justify-center">
          <p>...</p>
        </Pagination.Ellipsis>
      )}
      count={props.totalPages}
      class="bg-mud-800 sticky bottom-0 [&>ul]:flex [&>ul]:justify-center [&>ul]:gap-2 [&>ul]:p-2 [&>ul]:border-t [&>ul]:border-t-mud-700"
    >
      {/* <Pagination.Previous */}
      {/*   as="a" */}
      {/*   href={getPageUrl(props.page - 1)} */}
      {/*   class="flex items-center justify-center h-10 px-4 rounded-md hover:bg-stats-bg" */}
      {/* > */}
      {/*   Previous */}
      {/* </Pagination.Previous> */}
      <Pagination.Items />
      {/* <Pagination.Next */}
      {/*   as="a" */}
      {/*   href={getPageUrl(props.page + 1)} */}
      {/*   class="flex items-center justify-center h-10 px-4 rounded-md hover:bg-stats-bg" */}
      {/* > */}
      {/*   Next */}
      {/* </Pagination.Next> */}
    </Pagination.Root>
  );
};
