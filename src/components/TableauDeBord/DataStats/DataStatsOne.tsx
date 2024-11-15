import React from "react";
import Link from "next/link";

const DataStatsOne: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
        <Link href="/tableaudebord/itcloud">
          <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
            <div className="flex h-14.5 w-14.5 items-center justify-center rounded-full bg-[#4aa9b8]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                className="text- fill-current"
                height="30"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#fff"
                  d="M6.5 20q-2.275 0-3.887-1.575T1 14.575q0-1.95 1.175-3.475T5.25 9.15q.625-2.3 2.5-3.725T12 4q2.925 0 4.963 2.038T19 11q1.725.2 2.863 1.488T23 15.5q0 1.875-1.312 3.188T18.5 20zm0-2h12q1.05 0 1.775-.725T21 15.5t-.725-1.775T18.5 13H17v-2q0-2.075-1.463-3.538T12 6T8.463 7.463T7 11h-.5q-1.45 0-2.475 1.025T3 14.5t1.025 2.475T6.5 18m5.5-6"
                />
              </svg>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <h4 className="mb-1.5 text-heading-6 font-bold text-dark dark:text-white">
                  ITCloud
                </h4>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/tableaudebord/securitereseau">
          <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
            <div className="flex h-14.5 w-14.5 items-center justify-center rounded-full bg-[#f9c954]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#fff"
                  d="M13 19h1a1 1 0 0 1 1 1h7v2h-7a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1H2v-2h7a1 1 0 0 1 1-1h1v-1.66C8.07 16.13 6 13 6 9.67v-4L12 3l6 2.67v4c0 3.33-2.07 6.46-5 7.67zM12 5L8 6.69V10h4zm0 5v6c1.91-.47 4-2.94 4-5v-1z"
                />
              </svg>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <h4 className="mb-1.5 text-heading-6 font-bold text-dark dark:text-white">
                  Sécurité réseau
                </h4>
              </div>
            </div>
          </div>
        </Link>
        <Link href="/tableaudebord/datacenter&energie">
          <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark">
            <div className="flex h-14.5 w-14.5 items-center justify-center rounded-full bg-[#3183ba]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 32 32"
              >
                <path
                  fill="#fff"
                  d="M28 10h-5V6a2 2 0 0 0-2-2H11a2 2 0 0 0-2 2v4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V12a2 2 0 0 0-2-2M4 28V12h5v2H7v2h2v2H7v2h2v2H7v2h2v4Zm17 0H11V6h10Zm7 0h-5v-4h2v-2h-2v-2h2v-2h-2v-2h2v-2h-2v-2h5Z"
                />
                <path fill="#fff" d="M14 8h4v2h-4zm0 4h4v2h-4zm0 4h4v2h-4z" />
              </svg>
            </div>

            <div className="mt-6 flex items-end justify-between">
              <div>
                <h4 className="mb-1.5 text-heading-6 font-bold text-dark dark:text-white">
                  Data center & énergie
                </h4>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default DataStatsOne;
