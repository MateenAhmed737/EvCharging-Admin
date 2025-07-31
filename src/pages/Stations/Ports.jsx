import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiCheck, BiSolidCopy } from "react-icons/bi";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context";
import { cn } from "../../lib/utils";
import { convertPropsToObject, fetchData, getObjProperty } from "../../utils";
import { base_url, token } from "../../utils/url";
import GeneralPage from "../GeneralPage";

const SERVER_URL =
  "wss://csms.charznet.com/steve/websocket/CentralSystemService";
const neededProps = [
  "_id",
  "station_id",
  "charger_id",
  "connector_id",
  "port_image",
  "port_name",
  "port_type",
  "unit_price",
  "charging_power",
  "port_description",
];
const template = convertPropsToObject(neededProps);
const showAllPorts = `${base_url}/admin/station_port_list`;
const editUrl = `${base_url}/admin/edit_station_port`;
const createUrl = `${base_url}/admin/create_station_port`;
const deleteUrl = `${base_url}/admin/delete_port`;

const Ports = () => {
  const { user } = useContext(AppContext);
  const { station_id } = useParams();
  const [, setSearchText] = useState("");
  const [data, setData] = useState(null);
  const [reload, setReload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paginatedData, setPaginatedData] = useState({
    items: [],
    curItems: [],
  });

  const search = (e) => {
    const str = e.target.value;
    setSearchText(str.trim());

    if (str.trim() === "") {
      setPaginatedData((prev) => ({ ...prev, items: data }));
    } else {
      setPaginatedData((prev) => ({
        ...prev,
        items: data.filter((item) =>
          Object.keys(template).some((key) => {
            const amountMatched = dollarFields.some((e) =>
              ("$" + Number(item?.[e]).toFixed(2)).includes(str)
            );
            const othersMatched = String(item?.[key])
              ?.toLowerCase()
              ?.includes(str?.toLowerCase());

            return amountMatched || othersMatched;
          })
        ),
      }));
    }
  };

  const permissions = user?.permissions;
  const hasEditAccess =
    user?.role_id === "super_admin" ||
    getObjProperty(permissions, "stations.ports.edit");
  const hasCreateAccess =
    user?.role_id === "super_admin" ||
    getObjProperty(permissions, "stations.ports.create");
  const hasDeleteAccess =
    user?.role_id === "super_admin" ||
    getObjProperty(permissions, "stations.ports.delete");

  const dollarFields = ["unit_price"];
  const inputFields = [
    {
      key: "charging_power",
      type: "number",
      min: 0,
    },
    {
      key: "unit_price",
      type: "number",
      min: 0,
    },
  ];

  const initialState = {
    station_id,
    charger_id: "",
    connector_id: "",
    port_image: "",
    port_name: "",
    port_type: "",
    unit_price: "",
    charging_power: "",
    port_description: "",
  };

  const uploadFields = [
    {
      key: "port_image",
      title: "Port Image",
    },
  ];

  const appendableFields = [
    {
      key: "id",
      appendFunc: (key, value, formdata) => {
        formdata.append("_id", value);
        console.log("_id", value);
      },
    },
  ];

  const props = {
    title: "Ports",
    actionCols: ["Edit", "Delete"],
    data,
    setData,
    template,
    isLoading,
    deleteUrl,
    actions: {
      hasEditAccess,
      hasDeleteAccess,
    },
    search: {
      type: "text",
      onChange: search,
      placeholder: "Search by ID, Name, Type, Price...",
    },
    pagination: {
      paginatedData,
      setPaginatedData,
      curLength: paginatedData.items.length,
    },
    createModalProps: {
      createUrl,
      neededProps,
      initialState,
      uploadFields,
      inputFields,
      hideFields: ["station_id"],
      textAreaFields: ["port_description"],
      excludeFields: ["_id", "created_at", "updated_at"],
      successCallback: (json) => {
        setReload((prev) => !prev);
        toast.success(json.message);
      },
      gridCols: 2,
    },
    editModalProps: {
      editUrl,
      template,
      neededProps,
      uploadFields,
      appendableFields,
      hideFields: ["_id"],
      textAreaFields: ["port_description"],
      excludeFields: ["station_id", "created_at", "updated_at"],
      successCallback: (json) => {
        setReload((prev) => !prev);
        toast.success(json.message);
      },
      gridCols: 2,
    },
    tableProps: {
      checkboxEnabled: false,
      dollarFields,
    },
    headerStyles:
      "min-[490px]:flex-row min-[490px]:space-y-0 min-[490px]:space-x-2 max-[490px]:flex-col max-[490px]:space-y-2 max-[490px]:space-x-0 max-[840px]:flex-col max-[840px]:space-y-2 max-[840px]:space-x-0 !items-baseline",
    hasCreateAccess,
    headerButtons: [<CopyServerUrlButton />],
  };

  useEffect(() => {
    const formdata = new FormData();
    formdata.append("station_id", station_id);

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetchData({
      neededProps,
      setIsLoading,
      requestOptions,
      url: showAllPorts,
      sort: (data) => data?.sort((a, b) => b.id - a.id),
      callback: (data) => {
        setData(data);
        setPaginatedData((prev) => ({ ...prev, items: data }));
      },
    });
  }, [station_id, reload]);

  return <GeneralPage {...props} />;
};

function CopyServerUrlButton() {
  const id = React.useId();
  const inputRef = React.useRef(null);
  const [isURLCopied, setIsURLCopied] = React.useState(false);

  const handleCopyServerUrl = async () => {
    if (inputRef.current) {
      navigator.clipboard.writeText(inputRef.current.value);
      setIsURLCopied(true);
      setTimeout(() => setIsURLCopied(false), 1500);
    }
  };

  return (
    <div className="relative min-w-[250px] mr-2">
      <input
        ref={inputRef}
        id={id}
        className={cn(
          "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full pe-8 min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] truncate overflow-hidden"
        )}
        type="text"
        defaultValue={SERVER_URL}
        readOnly
      />
      <button
        onClick={handleCopyServerUrl}
        className="focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-8 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed"
        disabled={isURLCopied}
      >
        <div
          className={cn(
            "transition-all",
            isURLCopied ? "scale-100 opacity-100" : "scale-0 opacity-0"
          )}
        >
          <BiCheck size={18} />
        </div>
        <div
          className={cn(
            "absolute transition-all",
            isURLCopied ? "scale-0 opacity-0" : "scale-100 opacity-100"
          )}
        >
          <BiSolidCopy size={16} />
        </div>
      </button>
    </div>
  );
}

export default Ports;
