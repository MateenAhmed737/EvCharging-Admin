import React, { useMemo } from "react";
import Actions from "../Actions";
import {
  country_image_base_url,
  image_base_url,
  ports_image_base_url,
  station_image_base_url,
  users_image_base_url,
} from "../../utils/url";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import toast from "react-hot-toast";

const CommonTable = ({
  state,
  setState,
  selected,
  template,
  props = {},
  setSelected,
  paginatedData,
  actionCols = [],
  hideFields = [],
  dateFields = [],
  dollarFields = [],
  setPaginatedData,
  excludeFields = [],
  checkboxEnabled = false,
}) => {
  const [, copyToClipboard] = useCopyToClipboard();
  const keys = Object.keys(template).filter((e) => !excludeFields.includes(e));

  const removeUnderscore = (str) =>
    str.replace(/^.|_./g, (match) => match.toUpperCase()).replace(/_/g, " ");

  const imageBaseUrl = useMemo(() => {
    switch (props.title) {
      case "Stations":
        return station_image_base_url;
      case "Ports":
        return ports_image_base_url;
      case "Country Codes":
        return country_image_base_url;
      case "Users":
        return users_image_base_url;
      default:
        return image_base_url;
    }
  }, [props.title]);

  const handleCopy = (params) => {
    const { value, successMessage, errorMessage } = params;
    try {
      copyToClipboard(value);
      toast.success(successMessage);
    } catch (error) {
      toast.error(errorMessage);
      console.error("Failed to copy server url: ", error);
      console.log("error?.code", error?.code);
    }
  };
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      setSelected(paginatedData.curItems.map((e) => e?.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (e, data) => {
    const isChecked = e.target.checked;

    if (isChecked) {
      setSelected((prev) => [...prev, data?.id]);
    } else {
      setSelected((prev) => prev.filter((id) => id !== data?.id));
    }
  };

  const hasSelectedAll = useMemo(
    () =>
      paginatedData &&
      paginatedData.curItems.length !== 0 &&
      paginatedData.curItems.every((e) => selected.includes(e?.id)),
    [paginatedData, selected]
  );

  return (
    <>
      <div className="relative overflow-hidden overflow-x-auto">
        <table className="w-full overflow-hidden text-sm text-left text-black rounded-md bg-gray-50">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              {checkboxEnabled && (
                <th scope="col" className="px-6 py-3 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={hasSelectedAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded cursor-pointer focus:ring-blue-500"
                  />
                </th>
              )}
              {keys.map(
                (elem) =>
                  elem?.at(0) !== "_" && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-center"
                      key={elem}
                    >
                      {removeUnderscore(elem)}
                    </th>
                  )
              )}
              {actionCols &&
                actionCols.map((elem) => (
                  <th key={elem} scope="col" className="px-6 py-3 text-center">
                    {elem}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {state?.length ? (
              state?.map((data) => (
                <tr
                  className="border-b bg-gray-50 hover:bg-gray-100"
                  key={data.id}
                >
                  {checkboxEnabled && (
                    <td className="px-6 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(data?.id)}
                        onChange={(e) => handleSelect(e, data)}
                        id={data?.id}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded cursor-pointer focus:ring-blue-500"
                      />
                    </td>
                  )}

                  {keys.map((key) => {
                    const value = data[key];
                    const tableCellKey = key + (data._id || data.id);

                    if (hideFields.includes(key) || key?.at(0) === "_")
                      return "";

                    return key.includes("image") && value ? (
                      <td
                        key={tableCellKey}
                        className="px-6 py-4 text-xs text-center whitespace-nowrap md:whitespace-normal"
                      >
                        <img
                          src={imageBaseUrl + value}
                          alt={key}
                          className="object-cover object-center h-10 mx-auto origin-center"
                        />
                      </td>
                    ) : key.includes("date") &&
                      key.includes("time") &&
                      value ? (
                      <td
                        key={tableCellKey}
                        className="px-6 py-4 text-xs text-center whitespace-nowrap md:whitespace-normal"
                      >
                        {new Date(value).toLocaleString()}
                      </td>
                    ) : dateFields.includes(key) && value ? (
                      <td
                        key={tableCellKey}
                        className="px-6 py-4 text-xs text-center whitespace-nowrap md:whitespace-normal"
                      >
                        {new Date(value).toDateString()}
                      </td>
                    ) : dollarFields.includes(key) && value ? (
                      <td
                        key={tableCellKey}
                        className="px-6 py-4 text-xs text-center whitespace-nowrap md:whitespace-normal"
                      >
                        ${Number(value).toFixed(2)}
                      </td>
                    ) : key === "charger_id" &&
                      window.location.pathname.endsWith("/ports") &&
                      value ? (
                      <td
                        key={tableCellKey}
                        className="px-6 py-4 text-xs text-center whitespace-nowrap md:whitespace-normal"
                      >
                        <span
                          onClick={() =>
                            handleCopy({
                              value,
                              successMessage: "Charger ID copied!",
                            })
                          }
                          className="cursor-pointer hover:text-primary-500 transition-all"
                        >
                          {value}
                        </span>
                      </td>
                    ) : value !== null &&
                      value !== undefined &&
                      value !== "" ? (
                      <td
                        key={tableCellKey}
                        className="px-6 py-4 text-xs text-center whitespace-nowrap md:whitespace-normal"
                      >
                        {value}
                      </td>
                    ) : (
                      <td
                        className="px-6 py-4 text-xs text-center"
                        key={key + data.id}
                      >
                        -
                      </td>
                    );
                  })}

                  {actionCols && (
                    <Actions
                      {...{
                        data,
                        setData: setState,
                        id: data.id,
                        actionCols,
                        ...props,
                      }}
                    />
                  )}
                </tr>
              ))
            ) : (
              <tr className="text-center border-b bg-gray-50 hover:bg-gray-100">
                <td
                  className={`"px-6 py-4 whitespace-nowrap text-xs`}
                  colSpan={keys.length + (actionCols?.length + 1 || 0)}
                >
                  No data found!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CommonTable;
