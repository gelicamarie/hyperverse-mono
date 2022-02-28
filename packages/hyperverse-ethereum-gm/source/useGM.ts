import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, UseMutationOptions } from 'react-query';
import { ethers } from 'ethers';
import { useEthereum } from '@decentology/hyperverse-ethereum';
import { FACTORY_ABI, GM_ABI, FACTORY_ADDRESS } from './constants';
import { createContainer, useContainer } from '@decentology/unstated-next';

type ContractState = ethers.Contract;

function GMState(initialState: { tenantId: string } = { tenantId: '' }) {
	const { tenantId } = initialState;
	const { address, web3Provider, provider } = useEthereum();
	const [factoryContract, setFactoryContract] = useState<ContractState>(
		new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider) as ContractState
	);
	const [proxyContract, setProxyContract] = useState<ContractState>();

	const signer = useMemo(async () => {
		return web3Provider?.getSigner();
	}, [web3Provider]);

	useEffect(() => {
		const fetchContract = async () => {
			const proxyAddress = await factoryContract.getProxy(tenantId);
			const proxyCtr = new ethers.Contract(proxyAddress, GM_ABI, provider);
			const accountSigner = await signer;
			if (accountSigner) {
				setProxyContract(proxyCtr.connect(accountSigner));
			} else {
				setProxyContract(proxyCtr);
			}
		};
		fetchContract();
	}, [factoryContract, tenantId, provider, signer]);

	const setup = useCallback(async () => {
		const accountSigner = await signer;
		if (accountSigner) {
			const ctr = factoryContract.connect(accountSigner) as ContractState;
			setFactoryContract(ctr);
		}
		// We have a defualt contract that has no signer. Which will work for read-only operations.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [signer]);


	const errors = (err: any) => {
		if (!factoryContract?.signer) {
			throw new Error('Please connect your wallet!');
		}

		if (err.code === 4001) {
			throw new Error('You rejected the transaction!');
		}

		throw err;
	};

	useEffect(() => {
		if (web3Provider) {
			setup();
		}
	}, [web3Provider]);

	const checkInstance = useCallback(
		async (account: any) => {
			try {
				const instance = await factoryContract.instance(account);
				return instance;
			} catch (err) {
				return false;
			}
		},
		[factoryContract]
	);

	const createInstance = useCallback(async () => {
		try {
			const createTxn = await factoryContract.createInstance();
			return createTxn.wait();
		} catch (err) {
			errors(err);
			throw err;
		}
	}, [factoryContract]);

	const getTotalGMs = async () => {
		try {
			const totalGMs = await proxyContract?.getTotalGMs();
			return totalGMs.toNumber();
		} catch (err) {
			errors(err);
			throw err;
		}
	};

	const getAllGMs = async () => {
		try {
			const AllGMs = await proxyContract?.getAllGMs();
			return AllGMs;
		} catch (err) {
			errors(err);
			throw err;
		}
	};

	const sayGM = async (gm: string) => {
		try {
			const sayGMtxn = await proxyContract?.sayGM(gm);
			return sayGMtxn.wait();
		} catch (err) {
			errors(err);
			throw err;
		}
	}
	
	return {
		tenantId,
		factoryContract,
		proxyContract,
		CheckInstance: () =>
			useQuery(['checkInstance', address, factoryContract?.address], () => checkInstance(address), {
				enabled: !!address && !!factoryContract?.address,
			}),
		NewInstance: (
			options?: Omit<UseMutationOptions<unknown, unknown, void, unknown>, 'mutationFn'>
		) => useMutation(createInstance, options),
		TotalGMs: () =>
		useQuery(['getTotalGMs', address], () => getTotalGMs(), {
			enabled: !!proxyContract?.signer && !!address,
		}),
		AllGMs: () =>
		useQuery(['getAllGMs', address], () => getAllGMs(), {
			enabled: !!proxyContract?.signer && !!address,
		}),
		SayGM: (
			options?: Omit<
				UseMutationOptions<unknown, unknown, { gm: string }, unknown>,
				'mutationFn'
			>
		) => useMutation(({ gm }) => sayGM(gm), options),

	}
}

export const GM = createContainer(GMState);

export function useGM() {
	return useContainer(GM);
}
